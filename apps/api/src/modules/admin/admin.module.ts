import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminController } from "./admin.controller";
import { User, UserSchema } from "../../schemas/user.schema";
import { Portfolio, PortfolioSchema } from "../../schemas/portfolio.schema";
import { AiReport, AiReportSchema } from "../../schemas/content.schema";
import { AuditLog, AuditLogSchema, FeatureFlag, FeatureFlagSchema, ModerationReport, ModerationReportSchema } from "../../schemas/ops.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Portfolio.name, schema: PortfolioSchema },
      { name: AiReport.name, schema: AiReportSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: FeatureFlag.name, schema: FeatureFlagSchema },
      { name: ModerationReport.name, schema: ModerationReportSchema },
    ]),
  ],
  controllers: [AdminController],
})
export class AdminModule {}
