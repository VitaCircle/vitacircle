import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Portfolio, PortfolioDocument } from "../../schemas/portfolio.schema";
import { Version, VersionDocument } from "../../schemas/content.schema";
import { User, UserDocument } from "../../schemas/user.schema";
import { draftFromTemplate, TEMPLATES, draftTreeSchema } from "@vitacircle/shared";
import { EntitlementsService } from "../../services/entitlements.service";
import type { AuthUser } from "../../common/decorators/auth";

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectModel(Portfolio.name) private portfolios: Model<PortfolioDocument>,
    @InjectModel(Version.name) private versionModel: Model<VersionDocument>,
    @InjectModel(User.name) private users: Model<UserDocument>,
    private entitlements: EntitlementsService,
  ) {}

  async list(user: AuthUser) {
    return this.portfolios.find({ ownerId: user.userId, status: { $ne: "archived" } }).sort({ updatedAt: -1 });
  }

  async create(user: AuthUser, body: { title?: string; vertical?: string; templateId?: string }) {
    const e = this.entitlements.forUser(user);
    const count = await this.portfolios.countDocuments({ ownerId: user.userId, status: { $ne: "archived" } });
    this.entitlements.assertUnderLimit(count, e.maxPortfolios, "Portfolio");
    const template = TEMPLATES.find((t) => t.id === body.templateId) ?? TEMPLATES.find((t) => t.vertical === body.vertical) ?? TEMPLATES[0];
    if (!template.free && user.plan === "free") {
      const freeUsed = await this.portfolios.countDocuments({ ownerId: user.userId, templateId: { $nin: TEMPLATES.filter((t) => t.free).map((t) => t.id) } });
      if (freeUsed >= 0 && !template.free) throw new ForbiddenException("Pro template — upgrade required");
    }
    const owner = await this.users.findById(user.userId);
    const title = body.title || `${template.name} portfolio`;
    const slug = `${owner?.username || "user"}-${Date.now().toString(36)}`;
    return this.portfolios.create({
      ownerId: user.userId,
      orgId: user.orgId || null,
      title,
      vertical: body.vertical || template.vertical,
      templateId: template.id,
      themeId: template.id,
      draft: draftFromTemplate(template.id),
      slug,
      status: "draft",
    });
  }

  async getOwned(user: AuthUser, id: string) {
    const doc = await this.portfolios.findOne({
      _id: id,
      $or: [{ ownerId: user.userId }, { collaboratorIds: user.userId }],
    });
    if (!doc) throw new NotFoundException("Portfolio not found");
    return doc;
  }

  async updateDraft(user: AuthUser, id: string, draft: unknown, title?: string, targetRole?: string) {
    const doc = await this.getOwned(user, id);
    const parsed = draftTreeSchema.parse(draft);
    doc.draft = parsed;
    if (title) doc.title = title;
    if (targetRole !== undefined) doc.targetRole = targetRole;
    await doc.save();
    const e = this.entitlements.forUser(user);
    if (e.versionHistory) {
      const n = await this.versionModel.countDocuments({ portfolioId: doc._id });
      if (n > 40) {
        const oldest = await this.versionModel.find({ portfolioId: doc._id }).sort({ createdAt: 1 }).limit(1);
        if (oldest[0]) await this.versionModel.deleteOne({ _id: oldest[0]._id });
      }
      await this.versionModel.create({ portfolioId: doc._id, ownerId: user.userId, snapshot: parsed, label: "autosave" });
    }
    return doc;
  }

  async duplicate(user: AuthUser, id: string) {
    const e = this.entitlements.forUser(user);
    const count = await this.portfolios.countDocuments({ ownerId: user.userId, status: { $ne: "archived" } });
    this.entitlements.assertUnderLimit(count, e.maxPortfolios, "Portfolio");
    const src = await this.getOwned(user, id);
    return this.portfolios.create({
      ownerId: user.userId,
      orgId: src.orgId,
      title: `${src.title} copy`,
      vertical: src.vertical,
      templateId: src.templateId,
      themeId: src.themeId,
      draft: src.draft,
      status: "draft",
      slug: `${src.slug}-copy-${Date.now().toString(36)}`,
    });
  }

  async archive(user: AuthUser, id: string) {
    const doc = await this.getOwned(user, id);
    doc.status = "archived";
    await doc.save();
    return { ok: true };
  }

  async listVersions(user: AuthUser, id: string) {
    await this.getOwned(user, id);
    return this.versionModel.find({ portfolioId: new Types.ObjectId(id) }).sort({ createdAt: -1 }).limit(30);
  }

  async restoreVersion(user: AuthUser, id: string, versionId: string) {
    const doc = await this.getOwned(user, id);
    const v = await this.versionModel.findOne({ _id: versionId, portfolioId: doc._id });
    if (!v) throw new NotFoundException("Version not found");
    doc.draft = v.snapshot;
    await doc.save();
    return doc;
  }

  async applySuggestion(user: AuthUser, id: string, blockId: string, field: string, proposed: string) {
    const doc = await this.getOwned(user, id);
    const draft = doc.draft as { blocks: { id: string; data: Record<string, unknown> }[] };
    const block = draft.blocks.find((b) => b.id === blockId);
    if (!block) throw new NotFoundException("Block not found");
    block.data[field] = proposed;
    doc.markModified("draft");
    await doc.save();
    return doc;
  }

  templates() {
    return TEMPLATES;
  }
}
