import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../../schemas/user.schema";
import { Portfolio, PortfolioDocument } from "../../schemas/portfolio.schema";
import { Asset, AssetDocument } from "../../schemas/content.schema";
import { Session, SessionDocument } from "../../schemas/session.schema";
import { AuthService } from "../auth/auth.service";
import { authenticator } from "otplib";
import { StorageService } from "../../services/storage.service";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private users: Model<UserDocument>,
    @InjectModel(Portfolio.name) private portfolios: Model<PortfolioDocument>,
    @InjectModel(Asset.name) private assets: Model<AssetDocument>,
    @InjectModel(Session.name) private sessions: Model<SessionDocument>,
    private auth: AuthService,
    private storage: StorageService,
  ) {}

  async me(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundException("User not found");
    return this.auth.publicUser(user);
  }

  async updateMe(
    userId: string,
    patch: {
      displayName?: string;
      onboarding?: User["onboarding"];
      consents?: Partial<User["consents"]>;
      username?: string;
    },
  ) {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundException("User not found");
    if (patch.displayName !== undefined) user.displayName = patch.displayName;
    if (patch.onboarding) user.onboarding = { ...user.onboarding, ...patch.onboarding };
    if (patch.consents) user.consents = { ...user.consents, ...patch.consents };
    if (patch.username) {
      const taken = await this.users.findOne({ username: patch.username.toLowerCase(), _id: { $ne: user._id } });
      if (taken) throw new BadRequestException("Username taken");
      user.username = patch.username.toLowerCase();
    }
    await user.save();
    return this.auth.publicUser(user);
  }

  async exportData(userId: string) {
    const user = await this.users.findById(userId).lean();
    const portfolios = await this.portfolios.find({ ownerId: userId }).lean();
    const assets = await this.assets.find({ ownerId: userId }).lean();
    return { user, portfolios, assets };
  }

  async deleteAccount(userId: string) {
    const assets = await this.assets.find({ ownerId: userId });
    for (const a of assets) {
      await this.storage.remove(a.key);
    }
    await this.assets.deleteMany({ ownerId: userId });
    await this.portfolios.deleteMany({ ownerId: userId });
    await this.sessions.updateMany({ userId }, { revoked: true });
    await this.users.deleteOne({ _id: userId });
    return { ok: true };
  }

  async totpSetup(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundException();
    const secret = authenticator.generateSecret();
    user.totpSecret = secret;
    await user.save();
    const otpauth = authenticator.keyuri(user.email, "VitaCircle", secret);
    return { secret, otpauth };
  }

  async totpEnable(userId: string, code: string) {
    const user = await this.users.findById(userId);
    if (!user?.totpSecret) throw new BadRequestException("Setup TOTP first");
    if (!authenticator.check(code, user.totpSecret)) throw new BadRequestException("Invalid code");
    user.totpEnabled = true;
    await user.save();
    return { ok: true };
  }
}
