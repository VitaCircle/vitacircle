import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ConfigService } from "@nestjs/config";
import { createHash } from "crypto";
import { Portfolio, PortfolioDocument } from "../../schemas/portfolio.schema";
import { AiReport, AiReportDocument } from "../../schemas/content.schema";
import { User, UserDocument } from "../../schemas/user.schema";
import { EntitlementsService } from "../../services/entitlements.service";
import { heuristicScore, heuristicTailor, heuristicRewrite } from "./heuristic";
import type { AuthUser } from "../../common/decorators/auth";
import type { DraftTree } from "@vitacircle/shared";

@Injectable()
export class AiService {
  constructor(
    @InjectModel(Portfolio.name) private portfolios: Model<PortfolioDocument>,
    @InjectModel(AiReport.name) private reports: Model<AiReportDocument>,
    @InjectModel(User.name) private users: Model<UserDocument>,
    private entitlements: EntitlementsService,
    private config: ConfigService,
  ) {}

  private async owned(user: AuthUser, id: string) {
    const p = await this.portfolios.findOne({ _id: id, ownerId: user.userId });
    if (!p) throw new NotFoundException("Portfolio not found");
    return p;
  }

  private async meter(user: AuthUser) {
    const e = this.entitlements.forUser(user);
    const u = await this.users.findById(user.userId);
    if (!u) throw new NotFoundException();
    const start = u.aiPeriodStart ? new Date(u.aiPeriodStart) : new Date(0);
    const monthAgo = Date.now() - 30 * 86400000;
    if (start.getTime() < monthAgo) {
      u.aiScoresThisPeriod = 0;
      u.aiPeriodStart = new Date();
    }
    if (!e.unlimitedAi && u.aiScoresThisPeriod >= e.aiScoresPerMonth) {
      throw new ForbiddenException("AI quota reached for this billing period");
    }
    u.aiScoresThisPeriod += 1;
    await u.save();
  }

  private async callPython(path: string, body: unknown) {
    const base = this.config.get("AI_URL") || "http://localhost:8000";
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 14000);
    try {
      const res = await fetch(`${base}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error("ai-down");
      return await res.json();
    } finally {
      clearTimeout(t);
    }
  }

  async score(user: AuthUser, portfolioId: string, targetRole?: string, jobDescription?: string) {
    await this.meter(user);
    const p = await this.owned(user, portfolioId);
    const u = await this.users.findById(user.userId);
    const draft = p.draft as DraftTree;
    const role = targetRole || p.targetRole || u?.onboarding?.targetRole || "creative professional";
    let result;
    const skipLlm = !!u?.consents?.doNotSendToLlm || this.config.get("AI_PROVIDER") === "heuristic";
    if (!skipLlm) {
      try {
        result = await this.callPython("/v1/score", { draft, targetRole: role, jobDescription });
      } catch {
        result = heuristicScore(draft, role, jobDescription);
      }
    } else {
      result = heuristicScore(draft, role, jobDescription);
    }
    const report = await this.reports.create({
      portfolioId: p._id,
      ownerId: user.userId,
      targetRole: role,
      jobDescHash: jobDescription ? createHash("sha256").update(jobDescription).digest("hex") : undefined,
      score: result.score,
      rubric: result.rubric,
      suggestions: result.suggestions,
      critique: result.critique,
      model: result.model,
      promptVersion: result.promptVersion,
      kind: "score",
    });
    return { ...result, id: report.id };
  }

  async tailor(user: AuthUser, portfolioId: string, jobDescription: string) {
    const e = this.entitlements.forUser(user);
    if (!e.jobTailor) throw new ForbiddenException("Job tailoring is a Pro feature");
    await this.meter(user);
    const p = await this.owned(user, portfolioId);
    const draft = p.draft as DraftTree;
    let result;
    try {
      result = await this.callPython("/v1/tailor", { draft, jobDescription, targetRole: p.targetRole });
    } catch {
      result = heuristicTailor(draft, jobDescription);
    }
    await this.reports.create({
      portfolioId: p._id,
      ownerId: user.userId,
      targetRole: p.targetRole,
      score: 0,
      rubric: {},
      suggestions: result.suggestions,
      critique: result.notes,
      model: result.model,
      kind: "tailor",
    });
    return result;
  }

  async rewrite(user: AuthUser, text: string, instruction: string) {
    await this.meter(user);
    try {
      return await this.callPython("/v1/rewrite", { text, instruction });
    } catch {
      return heuristicRewrite(text, instruction);
    }
  }

  async history(user: AuthUser, portfolioId: string) {
    await this.owned(user, portfolioId);
    return this.reports.find({ portfolioId, ownerId: user.userId }).sort({ createdAt: -1 }).limit(20);
  }
}
