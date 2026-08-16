import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true, collection: "sessions" })
export class Session {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  familyId!: string;

  @Prop({ required: true })
  refreshHash!: string;

  @Prop()
  userAgent?: string;

  @Prop()
  ip?: string;

  @Prop({ default: false })
  revoked!: boolean;

  @Prop()
  expiresAt!: Date;
}

export type SessionDocument = HydratedDocument<Session>;
export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
