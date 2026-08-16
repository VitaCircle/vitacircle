import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";
import { Portfolio, PortfolioSchema } from "../../schemas/portfolio.schema";
import { AiReport, AiReportSchema } from "../../schemas/content.schema";
import { User, UserSchema } from "../../schemas/user.schema";
import { EntitlementsService } from "../../services/entitlements.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Portfolio.name, schema: PortfolioSchema },
      { name: AiReport.name, schema: AiReportSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AiController],
  providers: [AiService, EntitlementsService],
})
export class AiModule {}
