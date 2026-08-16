import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true, collection: "users" })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  username!: string;

  @Prop()
  passwordHash?: string;

  @Prop({ default: "creator" })
  role!: "creator" | "admin" | "org_admin" | "recruiter";

  @Prop({ default: "free" })
  plan!: "free" | "pro" | "studio";

  @Prop({ type: Types.ObjectId, default: null })
  orgId!: Types.ObjectId | null;

  @Prop({ default: false })
  emailVerified!: boolean;

  @Prop()
  emailVerifyToken?: string;

  @Prop()
  resetToken?: string;

  @Prop()
  resetTokenExpires?: Date;

  @Prop({ default: false })
  totpEnabled!: boolean;

  @Prop()
  totpSecret?: string;

  @Prop()
  displayName?: string;

  @Prop()
  avatarAssetId?: string;

  @Prop({ type: Object, default: {} })
  onboarding!: {
    targetRole?: string;
    vertical?: string;
    experienceLevel?: string;
    intent?: "job_posting" | "exploring";
    completed?: boolean;
  };

  @Prop({ type: Object, default: {} })
  consents!: {
    termsAt?: Date;
    privacyAt?: Date;
    cookiesAt?: Date;
    aiTrainingOptIn?: boolean;
    doNotSendToLlm?: boolean;
    talentDirectory?: boolean;
  };

  @Prop({ default: 0 })
  storageUsedBytes!: number;

  @Prop({ default: 0 })
  aiScoresThisPeriod!: number;

  @Prop()
  aiPeriodStart?: Date;

  @Prop({ default: false })
  banned!: boolean;

  @Prop()
  googleId?: string;

  @Prop()
  linkedinId?: string;

  @Prop()
  stripeCustomerId?: string;

  @Prop({ default: "en" })
  locale!: string;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ orgId: 1 });
