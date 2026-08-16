import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as argon2 from "argon2";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { randomBytes, createHash } from "crypto";
import { Response } from "express";
import { User, UserDocument } from "../../schemas/user.schema";
import { Session, SessionDocument } from "../../schemas/session.schema";
import { MailService } from "../../services/mail.service";
import { SRS_MESSAGES } from "@vitacircle/shared";
import { authenticator } from "otplib";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private users: Model<UserDocument>,
    @InjectModel(Session.name) private sessions: Model<SessionDocument>,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  private hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private usernameFromEmail(email: string) {
    const base = email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase() || "user";
    return `${base}${Math.floor(Math.random() * 9999)}`;
  }

  async register(email: string, password: string, username?: string) {
    const existing = await this.users.findOne({ email: email.toLowerCase() });
    if (existing) throw new ConflictException("An account with this email already exists");
    const uname = (username || this.usernameFromEmail(email)).toLowerCase();
    if (await this.users.findOne({ username: uname })) {
      throw new ConflictException("Username is taken");
    }
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const emailVerifyToken = randomBytes(24).toString("hex");
    const user = await this.users.create({
      email: email.toLowerCase(),
      username: uname,
      passwordHash,
      emailVerifyToken,
      consents: { termsAt: new Date(), privacyAt: new Date() },
    });
    const appUrl = this.config.get("APP_URL") || "http://localhost:3000";
    await this.mail.send(
      user.email,
      "Verify your VitaCircle email",
      `Confirm your email: ${appUrl}/verify?token=${emailVerifyToken}`,
    );
    return { id: user.id, email: user.email, username: user.username };
  }

  async verifyEmail(token: string) {
    const user = await this.users.findOne({ emailVerifyToken: token });
    if (!user) throw new BadRequestException("Invalid or expired verification token");
    user.emailVerified = true;
    user.emailVerifyToken = undefined;
    await user.save();
    return { ok: true };
  }

  async login(email: string, password: string, totp?: string, meta?: { ua?: string; ip?: string }) {
    const user = await this.users.findOne({ email: email.toLowerCase() });
    if (!user?.passwordHash) {
      throw new UnauthorizedException(SRS_MESSAGES.invalidCredentials);
    }
    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new UnauthorizedException(SRS_MESSAGES.invalidCredentials);
    if (user.banned) throw new UnauthorizedException("Account suspended");
    if (user.totpEnabled) {
      if (!totp || !user.totpSecret || !authenticator.check(totp, user.totpSecret)) {
        throw new UnauthorizedException("Two-factor code required");
      }
    }
    return this.issueTokens(user, meta);
  }

  async issueTokens(user: UserDocument, meta?: { ua?: string; ip?: string }) {
    const familyId = randomBytes(16).toString("hex");
    const refresh = randomBytes(40).toString("hex");
    const refreshHash = this.hashToken(refresh);
    const days = 30;
    await this.sessions.create({
      userId: user._id,
      familyId,
      refreshHash,
      userAgent: meta?.ua,
      ip: meta?.ip,
      expiresAt: new Date(Date.now() + days * 86400000),
    });
    const access = this.jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
      orgId: user.orgId ? String(user.orgId) : null,
      username: user.username,
    });
    return {
      accessToken: access,
      refreshToken: refresh,
      user: this.publicUser(user),
    };
  }

  setRefreshCookie(res: Response, token: string) {
    const secure = this.config.get("NODE_ENV") === "production";
    res.cookie("refresh_token", token, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/auth",
      maxAge: 30 * 86400000,
    });
  }

  async refresh(refreshToken: string, meta?: { ua?: string; ip?: string }) {
    if (!refreshToken) throw new UnauthorizedException("Missing refresh token");
    const hash = this.hashToken(refreshToken);
    const session = await this.sessions.findOne({ refreshHash: hash, revoked: false });
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException("Session expired");
    }
    const user = await this.users.findById(session.userId);
    if (!user || user.banned) throw new UnauthorizedException("Session expired");
    session.revoked = true;
    await session.save();
    return this.issueTokens(user, meta);
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return;
    const hash = this.hashToken(refreshToken);
    await this.sessions.updateOne({ refreshHash: hash }, { revoked: true });
  }

  async forgot(email: string) {
    const user = await this.users.findOne({ email: email.toLowerCase() });
    if (!user) return { ok: true };
    user.resetToken = randomBytes(24).toString("hex");
    user.resetTokenExpires = new Date(Date.now() + 3600000);
    await user.save();
    const appUrl = this.config.get("APP_URL") || "http://localhost:3000";
    await this.mail.send(
      user.email,
      "Reset your VitaCircle password",
      `Reset: ${appUrl}/reset?token=${user.resetToken}`,
    );
    return { ok: true };
  }

  async reset(token: string, password: string) {
    const user = await this.users.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    });
    if (!user) throw new BadRequestException("Invalid or expired reset token");
    user.passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();
    await this.sessions.updateMany({ userId: user._id }, { revoked: true });
    return { ok: true };
  }

  async oauthUpsert(provider: "google" | "linkedin", profile: { id: string; email: string; name?: string }) {
    const field = provider === "google" ? "googleId" : "linkedinId";
    let user = await this.users.findOne({ [field]: profile.id });
    if (!user) user = await this.users.findOne({ email: profile.email.toLowerCase() });
    if (!user) {
      user = await this.users.create({
        email: profile.email.toLowerCase(),
        username: this.usernameFromEmail(profile.email),
        [field]: profile.id,
        emailVerified: true,
        displayName: profile.name,
        consents: { termsAt: new Date(), privacyAt: new Date() },
      });
    } else {
      (user as unknown as Record<string, string>)[field] = profile.id;
      user.emailVerified = true;
      await user.save();
    }
    return this.issueTokens(user);
  }

  publicUser(user: UserDocument) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      plan: user.plan,
      orgId: user.orgId,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      onboarding: user.onboarding,
      consents: {
        aiTrainingOptIn: !!user.consents?.aiTrainingOptIn,
        doNotSendToLlm: !!user.consents?.doNotSendToLlm,
        talentDirectory: !!user.consents?.talentDirectory,
      },
      totpEnabled: user.totpEnabled,
    };
  }
}
