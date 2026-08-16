import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsEvent, AnalyticsEventSchema, AnalyticsDaily, AnalyticsDailySchema } from "../../schemas/ops.schema";
import { Portfolio, PortfolioSchema } from "../../schemas/portfolio.schema";
import { EntitlementsService } from "../../services/entitlements.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnalyticsEvent.name, schema: AnalyticsEventSchema },
      { name: AnalyticsDaily.name, schema: AnalyticsDailySchema },
      { name: Portfolio.name, schema: PortfolioSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [EntitlementsService],
})
export class AnalyticsModule {}
