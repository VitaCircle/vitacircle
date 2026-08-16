import { Body, Controller, ForbiddenException, Get, Param, Post } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AnalyticsEvent, AnalyticsDaily } from "../../schemas/ops.schema";
import { Portfolio } from "../../schemas/portfolio.schema";
import { CurrentUser, Public, type AuthUser } from "../../common/decorators/auth";
import { EntitlementsService } from "../../services/entitlements.service";

@Controller("analytics")
export class AnalyticsController {
  constructor(
    @InjectModel(AnalyticsEvent.name) private events: Model<AnalyticsEvent>,
    @InjectModel(AnalyticsDaily.name) private daily: Model<AnalyticsDaily>,
    @InjectModel(Portfolio.name) private portfolios: Model<Portfolio>,
    private entitlements: EntitlementsService,
  ) {}

  @Public()
  @Post("ingest")
  async ingest(
    @Body() body: { portfolioId: string; type: "view" | "play" | "download" | "time"; referrer?: string; device?: string; durationMs?: number },
  ) {
    const p = await this.portfolios.findById(body.portfolioId);
    if (!p || p.status !== "published") return { ok: true };
    await this.events.create({
      portfolioId: p._id,
      type: body.type,
      referrer: (body.referrer || "").slice(0, 200),
      device: body.device,
      durationMs: body.durationMs || 0,
    });
    const day = new Date().toISOString().slice(0, 10);
    const inc: Record<string, number> = {};
    if (body.type === "view") inc.views = 1;
    if (body.type === "play") inc.plays = 1;
    await this.daily.updateOne({ portfolioId: p._id, day }, { $inc: inc, $setOnInsert: { day, portfolioId: p._id } }, { upsert: true });
    return { ok: true };
  }

  @Get(":portfolioId")
  async dashboard(@CurrentUser() user: AuthUser, @Param("portfolioId") portfolioId: string) {
    const e = this.entitlements.forUser(user);
    if (!e.analytics) throw new ForbiddenException("Analytics is a Pro feature");
    const p = await this.portfolios.findOne({ _id: portfolioId, ownerId: user.userId });
    if (!p) throw new ForbiddenException();
    const series = await this.daily.find({ portfolioId: p._id }).sort({ day: 1 }).limit(90);
    const recent = await this.events.find({ portfolioId: p._id }).sort({ createdAt: -1 }).limit(50);
    return { series, recent };
  }
}
