import "reflect-metadata";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import mongoose from "mongoose";
import * as argon2 from "argon2";
import { User, UserSchema } from "../schemas/user.schema";
import { Session, SessionSchema } from "../schemas/session.schema";
import { Portfolio, PortfolioSchema } from "../schemas/portfolio.schema";
import {
  Version,
  VersionSchema,
  Asset,
  AssetSchema,
  AiReport,
  AiReportSchema,
  ExportJob,
  ExportJobSchema,
} from "../schemas/content.schema";
import {
  AnalyticsEvent,
  AnalyticsEventSchema,
  AnalyticsDaily,
  AnalyticsDailySchema,
  JobApplication,
  JobApplicationSchema,
  Subscription,
  SubscriptionSchema,
  AuditLog,
  AuditLogSchema,
  FeatureFlag,
  FeatureFlagSchema,
  Notification,
  NotificationSchema,
  Organization,
  OrganizationSchema,
  OrgInvite,
  OrgInviteSchema,
  Inquiry,
  InquirySchema,
  ApiKey,
  ApiKeySchema,
  Comment,
  CommentSchema,
  ModerationReport,
  ModerationReportSchema,
  StripeEvent,
  StripeEventSchema,
  CustomDomain,
  CustomDomainSchema,
} from "../schemas/ops.schema";

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(resolve(__dirname, "../../../.env"));
loadEnvFile(resolve(__dirname, "../../.env"));
loadEnvFile(resolve(process.cwd(), ".env"));

const indexesOnly = process.argv.includes("--indexes-only");

const registries: [string, mongoose.Schema][] = [
  [User.name, UserSchema],
  [Session.name, SessionSchema],
  [Portfolio.name, PortfolioSchema],
  [Version.name, VersionSchema],
  [Asset.name, AssetSchema],
  [AiReport.name, AiReportSchema],
  [ExportJob.name, ExportJobSchema],
  [AnalyticsEvent.name, AnalyticsEventSchema],
  [AnalyticsDaily.name, AnalyticsDailySchema],
  [JobApplication.name, JobApplicationSchema],
  [Subscription.name, SubscriptionSchema],
  [AuditLog.name, AuditLogSchema],
  [FeatureFlag.name, FeatureFlagSchema],
  [Notification.name, NotificationSchema],
  [Organization.name, OrganizationSchema],
  [OrgInvite.name, OrgInviteSchema],
  [Inquiry.name, InquirySchema],
  [ApiKey.name, ApiKeySchema],
  [Comment.name, CommentSchema],
  [ModerationReport.name, ModerationReportSchema],
  [StripeEvent.name, StripeEventSchema],
  [CustomDomain.name, CustomDomainSchema],
];

async function run() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/vitacircle";
  await mongoose.connect(uri);

  for (const [name, schema] of registries) {
    const model = mongoose.models[name] || mongoose.model(name, schema);
    await model.syncIndexes();
    console.log(`indexes synced: ${name}`);
  }

  if (indexesOnly) {
    await mongoose.disconnect();
    console.log("migrate complete (indexes only)");
    return;
  }

  const Flag = mongoose.models[FeatureFlag.name] || mongoose.model(FeatureFlag.name, FeatureFlagSchema);
  const flags = [
    { key: "collab", enabled: process.env.ENABLE_COLLAB !== "false", description: "Collaboration comments and invites" },
    { key: "malware_scan", enabled: process.env.ENABLE_MALWARE_SCAN === "true", description: "Scan uploads" },
    { key: "job_tailor", enabled: true, description: "AI job-tailor (Pro entitlement still applies)" },
  ];
  for (const flag of flags) {
    await Flag.updateOne({ key: flag.key }, { $set: flag }, { upsert: true });
  }

  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (email && password) {
    const Users = mongoose.models[User.name] || mongoose.model(User.name, UserSchema);
    const existing = await Users.findOne({ email: email.toLowerCase() });
    if (!existing) {
      await Users.create({
        email: email.toLowerCase(),
        username: "admin",
        passwordHash: await argon2.hash(password, { type: argon2.argon2id }),
        role: "admin",
        plan: "studio",
        emailVerified: true,
      });
      console.log(`seeded admin ${email}`);
    } else {
      console.log(`admin already exists: ${email}`);
    }
  } else {
    console.log("BOOTSTRAP_ADMIN_* unset — skipped admin seed");
  }

  await mongoose.disconnect();
  console.log("seed complete");
}

run().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
