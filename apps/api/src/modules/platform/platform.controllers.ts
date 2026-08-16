import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  Notification,
  JobApplication,
  Inquiry,
  Organization,
  OrgInvite,
  ApiKey,
  Comment,
  ModerationReport,
} from "../../schemas/ops.schema";
import { Portfolio } from "../../schemas/portfolio.schema";
import { User } from "../../schemas/user.schema";
import { CurrentUser, Public, Roles, type AuthUser } from "../../common/decorators/auth";
import { createHash, randomBytes } from "crypto";
import { EntitlementsService } from "../../services/entitlements.service";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

@Controller("notifications")
export class NotificationsController {
  constructor(@InjectModel(Notification.name) private notes: Model<Notification>) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.notes.find({ userId: user.userId }).sort({ createdAt: -1 }).limit(50);
  }

  @Patch(":id/read")
  async read(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    await this.notes.updateOne({ _id: id, userId: user.userId }, { read: true });
    return { ok: true };
  }
}

@Controller("applications")
export class ApplicationsController {
  constructor(@InjectModel(JobApplication.name) private apps: Model<JobApplication>) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.apps.find({ ownerId: user.userId }).sort({ updatedAt: -1 });
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() body: Partial<JobApplication>) {
    return this.apps.create({ ...body, ownerId: user.userId });
  }

  @Patch(":id")
  async update(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() body: Partial<JobApplication>) {
    const doc = await this.apps.findOneAndUpdate({ _id: id, ownerId: user.userId }, body, { new: true });
    if (!doc) throw new NotFoundException();
    return doc;
  }
}

@Controller("orgs")
export class OrgsController {
  constructor(
    @InjectModel(Organization.name) private orgs: Model<Organization>,
    @InjectModel(OrgInvite.name) private invites: Model<OrgInvite>,
    @InjectModel(User.name) private users: Model<User>,
  ) {}

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() body: { name: string; seats?: number }) {
    const org = await this.orgs.create({ name: body.name, seats: body.seats || 25, ownerId: user.userId, slug: body.name.toLowerCase().replace(/\s+/g, "-") });
    await this.users.updateOne({ _id: user.userId }, { orgId: org._id, role: "org_admin", plan: "studio" });
    return org;
  }

  @Get("mine")
  async mine(@CurrentUser() user: AuthUser) {
    if (!user.orgId) return null;
    return this.orgs.findById(user.orgId);
  }

  @Post("invite")
  @Roles("org_admin", "admin")
  async invite(@CurrentUser() user: AuthUser, @Body() body: { email: string }) {
    if (!user.orgId) throw new ForbiddenException("No organization");
    const org = await this.orgs.findById(user.orgId);
    const members = await this.users.countDocuments({ orgId: user.orgId });
    if (org && members >= org.seats) throw new ForbiddenException("Seat limit reached");
    const token = randomBytes(16).toString("hex");
    return this.invites.create({ orgId: user.orgId, email: body.email.toLowerCase(), token });
  }

  @Public()
  @Post("accept")
  async accept(@Body() body: { token: string; userId: string }) {
    const invite = await this.invites.findOne({ token: body.token, status: "pending" });
    if (!invite) throw new NotFoundException();
    await this.users.updateOne({ _id: body.userId }, { orgId: invite.orgId });
    invite.status = "accepted";
    await invite.save();
    return { ok: true };
  }
}

@Controller("talent")
export class TalentController {
  constructor(
    @InjectModel(Portfolio.name) private portfolios: Model<Portfolio>,
    @InjectModel(User.name) private users: Model<User>,
  ) {}

  @Public()
  @Get()
  async search(@Body() _b: unknown) {
    return this.directory();
  }

  @Public()
  @Get("search")
  async directory() {
    const opted = await this.users.find({ "consents.talentDirectory": true, banned: false }).select("username displayName onboarding");
    const ids = opted.map((u) => u._id);
    const ports = await this.portfolios.find({ ownerId: { $in: ids }, status: "published" }).limit(50);
    return { people: opted, portfolios: ports.map((p) => ({ id: p.id, title: p.title, vertical: p.vertical, publishedSlug: p.publishedSlug })) };
  }
}

@Controller("recruiter")
export class RecruiterController {
  constructor(
    @InjectModel(Inquiry.name) private inquiries: Model<Inquiry>,
    @InjectModel(Portfolio.name) private portfolios: Model<Portfolio>,
  ) {}

  @Public()
  @Post("inquiries")
  async inquire(@Body() body: { portfolioId: string; fromEmail: string; message: string }) {
    const p = await this.portfolios.findById(body.portfolioId);
    if (!p || p.status !== "published") throw new NotFoundException();
    return this.inquiries.create(body);
  }

  @Get("inquiries")
  list(@CurrentUser() user: AuthUser) {
    return this.inquiries.find({ recruiterId: user.userId }).sort({ createdAt: -1 });
  }

  @Post("become")
  async become(@CurrentUser() user: AuthUser) {
    return { ok: true, note: "Recruiter role granted on request in production via admin." };
  }
}

@Controller("v1")
export class PublicApiController {
  constructor(
    @InjectModel(ApiKey.name) private keys: Model<ApiKey>,
    @InjectModel(Portfolio.name) private portfolios: Model<Portfolio>,
  ) {}

  @Post("keys")
  async createKey(@CurrentUser() user: AuthUser, @Body() body: { name: string }) {
    const raw = `vc_${randomBytes(24).toString("hex")}`;
    const prefix = raw.slice(0, 10);
    await this.keys.create({ userId: user.userId, name: body.name || "default", prefix, hash: createHash("sha256").update(raw).digest("hex") });
    return { key: raw, prefix, note: "Store this key now; it will not be shown again." };
  }

  @Get("keys")
  listKeys(@CurrentUser() user: AuthUser) {
    return this.keys.find({ userId: user.userId, revoked: false }).select("name prefix createdAt lastUsedAt");
  }

  @Public()
  @Get("portfolios/:username/:slug")
  async publicPortfolio(@Param("username") username: string, @Param("slug") slug: string) {
    const p = await this.portfolios.findOne({ publishedSlug: `${username}/${slug}`, status: "published" });
    if (!p) throw new NotFoundException();
    return { title: p.title, vertical: p.vertical, snapshot: p.publishedSnapshot };
  }
}

@Controller("collab")
export class CollabController {
  constructor(
    @InjectModel(Comment.name) private comments: Model<Comment>,
    @InjectModel(Portfolio.name) private portfolios: Model<Portfolio>,
    private entitlements: EntitlementsService,
  ) {}

  @Get(":portfolioId/comments")
  async list(@CurrentUser() user: AuthUser, @Param("portfolioId") portfolioId: string) {
    await this.assertAccess(user, portfolioId);
    return this.comments.find({ portfolioId }).sort({ createdAt: 1 });
  }

  @Post(":portfolioId/comments")
  async add(@CurrentUser() user: AuthUser, @Param("portfolioId") portfolioId: string, @Body() body: { body: string; blockId?: string }) {
    await this.assertAccess(user, portfolioId);
    return this.comments.create({ portfolioId, authorId: user.userId, body: body.body, blockId: body.blockId });
  }

  @Post(":portfolioId/invite")
  async invite(@CurrentUser() user: AuthUser, @Param("portfolioId") portfolioId: string, @Body() body: { userId: string }) {
    const e = this.entitlements.forUser(user);
    if (e.collabSeats < 1) throw new ForbiddenException("Collaboration requires Pro");
    const p = await this.portfolios.findOne({ _id: portfolioId, ownerId: user.userId });
    if (!p) throw new NotFoundException();
    if (p.collaboratorIds.length >= e.collabSeats) throw new ForbiddenException("Collaborator limit reached");
    p.collaboratorIds.push(body.userId);
    await p.save();
    return p;
  }

  private async assertAccess(user: AuthUser, portfolioId: string) {
    const p = await this.portfolios.findOne({
      _id: portfolioId,
      $or: [{ ownerId: user.userId }, { collaboratorIds: user.userId }],
    });
    if (!p) throw new NotFoundException();
  }
}

@Controller("moderation")
export class ModerationPublicController {
  constructor(@InjectModel(ModerationReport.name) private mods: Model<ModerationReport>) {}

  @Public()
  @Post("report")
  report(@Body() body: { portfolioId?: string; reason: string; details?: string }) {
    return this.mods.create(body);
  }
}
