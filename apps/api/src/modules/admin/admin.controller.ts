import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../../schemas/user.schema";
import { Portfolio } from "../../schemas/portfolio.schema";
import { AiReport } from "../../schemas/content.schema";
import { AuditLog, FeatureFlag, ModerationReport } from "../../schemas/ops.schema";
import { CurrentUser, Roles, type AuthUser } from "../../common/decorators/auth";

@Controller("admin")
@Roles("admin")
export class AdminController {
  constructor(
    @InjectModel(User.name) private users: Model<User>,
    @InjectModel(Portfolio.name) private portfolios: Model<Portfolio>,
    @InjectModel(AiReport.name) private reports: Model<AiReport>,
    @InjectModel(AuditLog.name) private audit: Model<AuditLog>,
    @InjectModel(FeatureFlag.name) private flags: Model<FeatureFlag>,
    @InjectModel(ModerationReport.name) private mods: Model<ModerationReport>,
  ) {}

  @Get("users")
  usersList() {
    return this.users.find().select("-passwordHash -totpSecret").limit(100).sort({ createdAt: -1 });
  }

  @Get("users/:q")
  lookup(@Param("q") q: string) {
    return this.users.find({ $or: [{ email: q.toLowerCase() }, { username: q.toLowerCase() }] }).select("-passwordHash");
  }

  @Post("users/:id/ban")
  async ban(@CurrentUser() actor: AuthUser, @Param("id") id: string, @Body() body: { banned: boolean }) {
    await this.users.updateOne({ _id: id }, { banned: body.banned });
    await this.audit.create({ actorId: actor.userId, action: body.banned ? "user.ban" : "user.unban", meta: { id } });
    return { ok: true };
  }

  @Post("portfolios/:id/takedown")
  async takedown(@CurrentUser() actor: AuthUser, @Param("id") id: string) {
    await this.portfolios.updateOne({ _id: id }, { status: "unpublished" });
    await this.audit.create({ actorId: actor.userId, action: "portfolio.takedown", meta: { id } });
    return { ok: true };
  }

  @Get("flags")
  flagsList() {
    return this.flags.find();
  }

  @Patch("flags/:key")
  async setFlag(@CurrentUser() actor: AuthUser, @Param("key") key: string, @Body() body: { enabled: boolean }) {
    const doc = await this.flags.findOneAndUpdate({ key }, { enabled: body.enabled }, { upsert: true, new: true });
    await this.audit.create({ actorId: actor.userId, action: "flag.set", meta: { key, enabled: body.enabled } });
    return doc;
  }

  @Get("ai-cost")
  async aiCost() {
    const rows = await this.reports.aggregate([{ $group: { _id: "$model", count: { $sum: 1 }, tokens: { $sum: "$tokens" } } }]);
    return { models: rows };
  }

  @Get("moderation")
  moderation() {
    return this.mods.find({ status: "open" }).sort({ createdAt: -1 }).limit(50);
  }

  @Patch("moderation/:id")
  async resolve(@Param("id") id: string, @Body() body: { status: string }) {
    await this.mods.updateOne({ _id: id }, { status: body.status });
    return { ok: true };
  }
}
