import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true, collection: "versions" })
export class Version {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  portfolioId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  ownerId!: Types.ObjectId;

  @Prop({ type: Object, required: true })
  snapshot!: Record<string, unknown>;

  @Prop()
  label?: string;
}

export type VersionDocument = HydratedDocument<Version>;
export const VersionSchema = SchemaFactory.createForClass(Version);

@Schema({ timestamps: true, collection: "assets" })
export class Asset {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ required: true })
  key!: string;

  @Prop({ required: true })
  mime!: string;

  @Prop({ required: true })
  size!: number;

  @Prop({ default: "ready" })
  status!: "pending" | "scanning" | "ready" | "rejected";

  @Prop({ type: Object, default: {} })
  variants!: Record<string, string>;

  @Prop()
  hash?: string;

  @Prop()
  originalName?: string;

  @Prop({ default: "image" })
  kind!: "image" | "audio" | "video" | "document";
}

export type AssetDocument = HydratedDocument<Asset>;
export const AssetSchema = SchemaFactory.createForClass(Asset);

@Schema({ timestamps: true, collection: "aiReports" })
export class AiReport {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  portfolioId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  ownerId!: Types.ObjectId;

  @Prop()
  targetRole?: string;

  @Prop()
  jobDescHash?: string;

  @Prop({ required: true })
  score!: number;

  @Prop({ type: Object, required: true })
  rubric!: Record<string, number>;

  @Prop({ type: Array, default: [] })
  suggestions!: unknown[];

  @Prop({ type: Array, default: [] })
  critique!: string[];

  @Prop()
  model?: string;

  @Prop()
  promptVersion?: string;

  @Prop({ default: 0 })
  tokens!: number;

  @Prop({ default: "score" })
  kind!: "score" | "tailor" | "rewrite";
}

export type AiReportDocument = HydratedDocument<AiReport>;
export const AiReportSchema = SchemaFactory.createForClass(AiReport);

@Schema({ timestamps: true, collection: "exports" })
export class ExportJob {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  portfolioId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  ownerId!: Types.ObjectId;

  @Prop({ required: true })
  format!: "pdf" | "docx" | "ats-pdf";

  @Prop({ default: "queued" })
  status!: "queued" | "running" | "ready" | "failed";

  @Prop()
  storageKey?: string;

  @Prop()
  error?: string;

  @Prop()
  expiresAt?: Date;
}

export type ExportJobDocument = HydratedDocument<ExportJob>;
export const ExportJobSchema = SchemaFactory.createForClass(ExportJob);
