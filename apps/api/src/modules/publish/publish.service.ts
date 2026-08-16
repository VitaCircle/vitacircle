import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as argon2 from "argon2";
import { Portfolio, PortfolioDocument } from "../../schemas/portfolio.schema";
import { User, UserDocument } from "../../schemas/user.schema";
import { CustomDomain, CustomDomainDocument } from "../../schemas/ops.schema";
import { EntitlementsService } from "../../services/entitlements.service";
import type { AuthUser } from "../../common/decorators/auth";
import { randomBytes } from "crypto";

@Injectable()
export class PublishService {
  constructor(
    @InjectModel(Portfolio.name) private portfolios: Model<PortfolioDocument>,
    @InjectModel(User.name) private users: Model<UserDocument>,
    @InjectModel(CustomDomain.name) private domains: Model<CustomDomainDocument>,
    private entitlements: EntitlementsService,
  ) {}

  async publish(user: AuthUser, id: string, opts?: { slug?: string; password?: string }) {
    const owner = await this.users.findById(user.userId);
    if (!owner?.emailVerified) throw new ForbiddenException("Verify your email before publishing");
    const p = await this.portfolios.findOne({ _id: id, ownerId: user.userId });
    if (!p) throw new NotFoundException();
    const e = this.entitlements.forUser(user);
    const live = await this.portfolios.countDocuments({
      ownerId: user.userId,
      status: "published",
      _id: { $ne: p._id },
    });
    if (p.status !== "published") this.entitlements.assertUnderLimit(live, e.maxPortfolios, "Live portfolio");
    const slugPart = e.customSlug && opts?.slug ? opts.slug : p.slug || "portfolio";
    const publishedSlug = `${owner.username}/${slugPart}`.toLowerCase().replace(/[^a-z0-9/-]/g, "");
    const clash = await this.portfolios.findOne({ publishedSlug, _id: { $ne: p._id } });
    if (clash) throw new BadRequestException("Slug already in use");
    const draft = p.draft as { blocks?: { type: string; data: { alt?: string; media?: { alt?: string }[] } }[] };
    const images = (draft.blocks || []).flatMap((b) => b.data?.media || []);
    if (images.some((m) => m && !m.alt)) {
      throw new BadRequestException("Add alt text to every image before publishing");
    }
    p.publishedSnapshot = {
      ...(p.draft as object),
      publishedAt: new Date().toISOString(),
      title: p.title,
      vertical: p.vertical,
      ownerUsername: owner.username,
      slug: slugPart,
    };
    p.publishedSlug = publishedSlug;
    p.status = "published";
    if (opts?.password) {
      if (!e.passwordLinks) throw new ForbiddenException("Password links are a Pro feature");
      p.passwordHash = await argon2.hash(opts.password);
    }
    await p.save();
    return { url: `/${publishedSlug}`, publishedSlug };
  }

  async unpublish(user: AuthUser, id: string) {
    const p = await this.portfolios.findOne({ _id: id, ownerId: user.userId });
    if (!p) throw new NotFoundException();
    p.status = "unpublished";
    await p.save();
    return { ok: true };
  }

  async publicBySlug(username: string, slug: string, password?: string) {
    const publishedSlug = `${username}/${slug}`.toLowerCase();
    const p = await this.portfolios.findOne({ publishedSlug, status: "published" });
    if (!p?.publishedSnapshot) throw new NotFoundException("Portfolio not found");
    if (p.passwordHash) {
      if (!password || !(await argon2.verify(p.passwordHash, password))) {
        throw new UnauthorizedException("Password required");
      }
    }
    const owner = await this.users.findById(p.ownerId);
    return {
      id: p.id,
      title: p.title,
      vertical: p.vertical,
      snapshot: p.publishedSnapshot,
      owner: { username: owner?.username, displayName: owner?.displayName },
      branding: owner?.plan === "free",
    };
  }

  async requestDomain(user: AuthUser, portfolioId: string, host: string) {
    this.entitlements.require(user, "customDomain");
    const p = await this.portfolios.findOne({ _id: portfolioId, ownerId: user.userId });
    if (!p) throw new NotFoundException();
    const txtToken = `vitacircle-verify=${randomBytes(8).toString("hex")}`;
    const doc = await this.domains.findOneAndUpdate(
      { host: host.toLowerCase() },
      { userId: user.userId, portfolioId: p._id, host: host.toLowerCase(), verified: false, txtToken },
      { upsert: true, new: true },
    );
    p.customDomain = host.toLowerCase();
    await p.save();
    return { host: doc.host, txtToken: doc.txtToken, instruction: `Add a TXT record on ${host}: ${txtToken}` };
  }

  async verifyDomain(user: AuthUser, host: string) {
    const doc = await this.domains.findOne({ host: host.toLowerCase(), userId: user.userId });
    if (!doc) throw new NotFoundException();
    doc.verified = true;
    await doc.save();
    await this.portfolios.updateOne({ _id: doc.portfolioId }, { customDomainVerified: true });
    return { verified: true, note: "DNS lookup is stubbed in local/dev; production should query TXT records." };
  }
}
