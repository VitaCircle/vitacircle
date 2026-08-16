import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true, collection: "analyticsEvents" })
export class AnalyticsEvent {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  portfolioId!: Types.ObjectId;

  @Prop({ required: true })
  type!: "view" | "play" | "download" | "time";

  @Prop()
  referrer?: string;

  @Prop()
  country?: string;

  @Prop()
  device?: string;

  @Prop({ default: 0 })
  durationMs!: number;
}

export type AnalyticsEventDocument = HydratedDocument<AnalyticsEvent>;
export const AnalyticsEventSchema = SchemaFactory.createForClass(AnalyticsEvent);

@Schema({ collection: "analyticsDaily" })
export class AnalyticsDaily {
  @Prop({ required: true })
  day!: string;

  @Prop({ type: Types.ObjectId, required: true })
  portfolioId!: Types.ObjectId;

  @Prop({ default: 0 })
  views!: number;

  @Prop({ default: 0 })
  plays!: number;
}

export type AnalyticsDailyDocument = HydratedDocument<AnalyticsDaily>;
export const AnalyticsDailySchema = SchemaFactory.createForClass(AnalyticsDaily);
AnalyticsDailySchema.index({ portfolioId: 1, day: 1 }, { unique: true });

@Schema({ timestamps: true, collection: "applications" })
export class JobApplication {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  portfolioId?: Types.ObjectId;

  @Prop()
  versionId?: string;

  @Prop({ required: true })
  company!: string;

  @Prop({ required: true })
  role!: string;

  @Prop({ default: "wishlist" })
  status!: string;

  @Prop()
  notes?: string;

  @Prop()
  postingUrl?: string;
}

export type JobApplicationDocument = HydratedDocument<JobApplication>;
export const JobApplicationSchema = SchemaFactory.createForClass(JobApplication);

@Schema({ timestamps: true, collection: "subscriptions" })
export class Subscription {
  @Prop({ type: Types.ObjectId, required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop()
  stripeSubscriptionId?: string;

  @Prop()
  stripeCustomerId?: string;

  @Prop({ default: "inactive" })
  status!: string;

  @Prop({ default: "free" })
  plan!: string;

  @Prop()
  currentPeriodEnd?: Date;

  @Prop({ default: 0 })
  dunningAttempts!: number;
}

export type SubscriptionDocument = HydratedDocument<Subscription>;
export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

@Schema({ timestamps: true, collection: "auditLogs" })
export class AuditLog {
  @Prop({ type: Types.ObjectId })
  actorId?: Types.ObjectId;

  @Prop({ required: true })
  action!: string;

  @Prop({ type: Object, default: {} })
  meta!: Record<string, unknown>;
}

export type AuditLogDocument = HydratedDocument<AuditLog>;
export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

@Schema({ collection: "featureFlags" })
export class FeatureFlag {
  @Prop({ required: true, unique: true })
  key!: string;

  @Prop({ default: false })
  enabled!: boolean;

  @Prop()
  description?: string;
}

export type FeatureFlagDocument = HydratedDocument<FeatureFlag>;
export const FeatureFlagSchema = SchemaFactory.createForClass(FeatureFlag);

@Schema({ timestamps: true, collection: "notifications" })
export class Notification {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop()
  body?: string;

  @Prop({ default: false })
  read!: boolean;

  @Prop()
  href?: string;
}

export type NotificationDocument = HydratedDocument<Notification>;
export const NotificationSchema = SchemaFactory.createForClass(Notification);

@Schema({ timestamps: true, collection: "organizations" })
export class Organization {
  @Prop({ required: true })
  name!: string;

  @Prop()
  slug?: string;

  @Prop({ type: Types.ObjectId, required: true })
  ownerId!: Types.ObjectId;

  @Prop({ default: 25 })
  seats!: number;

  @Prop({ type: [String], default: [] })
  brandedTemplateIds!: string[];

  @Prop({ type: Object, default: {} })
  sso!: { enabled?: boolean; entryUrl?: string; entityId?: string };

  @Prop()
  stripeSubscriptionId?: string;
}

export type OrganizationDocument = HydratedDocument<Organization>;
export const OrganizationSchema = SchemaFactory.createForClass(Organization);

@Schema({ timestamps: true, collection: "orgInvites" })
export class OrgInvite {
  @Prop({ type: Types.ObjectId, required: true })
  orgId!: Types.ObjectId;

  @Prop({ required: true, lowercase: true })
  email!: string;

  @Prop({ required: true })
  token!: string;

  @Prop({ default: "pending" })
  status!: string;
}

export type OrgInviteDocument = HydratedDocument<OrgInvite>;
export const OrgInviteSchema = SchemaFactory.createForClass(OrgInvite);

@Schema({ timestamps: true, collection: "inquiries" })
export class Inquiry {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  portfolioId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  recruiterId?: Types.ObjectId;

  @Prop({ required: true })
  fromEmail!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ default: "open" })
  status!: string;
}

export type InquiryDocument = HydratedDocument<Inquiry>;
export const InquirySchema = SchemaFactory.createForClass(Inquiry);

@Schema({ timestamps: true, collection: "apiKeys" })
export class ApiKey {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  prefix!: string;

  @Prop({ required: true })
  hash!: string;

  @Prop()
  lastUsedAt?: Date;

  @Prop({ default: false })
  revoked!: boolean;
}

export type ApiKeyDocument = HydratedDocument<ApiKey>;
export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);

@Schema({ timestamps: true, collection: "comments" })
export class Comment {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  portfolioId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  authorId!: Types.ObjectId;

  @Prop()
  blockId?: string;

  @Prop({ required: true })
  body!: string;
}

export type CommentDocument = HydratedDocument<Comment>;
export const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema({ timestamps: true, collection: "reports" })
export class ModerationReport {
  @Prop({ type: Types.ObjectId })
  portfolioId?: Types.ObjectId;

  @Prop()
  reason!: string;

  @Prop()
  details?: string;

  @Prop({ default: "open" })
  status!: string;
}

export type ModerationReportDocument = HydratedDocument<ModerationReport>;
export const ModerationReportSchema = SchemaFactory.createForClass(ModerationReport);

@Schema({ timestamps: true, collection: "stripeEvents" })
export class StripeEvent {
  @Prop({ required: true, unique: true })
  eventId!: string;

  @Prop()
  type?: string;
}

export type StripeEventDocument = HydratedDocument<StripeEvent>;
export const StripeEventSchema = SchemaFactory.createForClass(StripeEvent);

@Schema({ timestamps: true, collection: "customDomains" })
export class CustomDomain {
  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  portfolioId!: Types.ObjectId;

  @Prop({ required: true, unique: true, lowercase: true })
  host!: string;

  @Prop({ default: false })
  verified!: boolean;

  @Prop()
  txtToken?: string;
}

export type CustomDomainDocument = HydratedDocument<CustomDomain>;
export const CustomDomainSchema = SchemaFactory.createForClass(CustomDomain);
