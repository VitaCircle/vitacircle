import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true, collection: "portfolios" })
export class Portfolio {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null })
  orgId!: Types.ObjectId | null;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  vertical!: string;

  @Prop({ default: "draft" })
  status!: "draft" | "published" | "unpublished" | "archived";

  @Prop({ type: Object, required: true })
  draft!: Record<string, unknown>;

  @Prop({ type: Object, default: null })
  publishedSnapshot!: Record<string, unknown> | null;

  @Prop()
  slug?: string;

  @Prop()
  publishedSlug?: string;

  @Prop()
  themeId?: string;

  @Prop()
  templateId?: string;

  @Prop()
  targetRole?: string;

  @Prop()
  passwordHash?: string;

  @Prop()
  customDomain?: string;

  @Prop({ default: false })
  customDomainVerified!: boolean;

  @Prop({ type: [String], default: [] })
  collaboratorIds!: string[];
}

export type PortfolioDocument = HydratedDocument<Portfolio>;
export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);
PortfolioSchema.index({ ownerId: 1 });
PortfolioSchema.index({ publishedSlug: 1 }, { unique: true, sparse: true });
PortfolioSchema.index({ customDomain: 1 }, { unique: true, sparse: true });
