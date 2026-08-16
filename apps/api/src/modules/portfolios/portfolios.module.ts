import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PortfoliosService } from "./portfolios.service";
import { PortfoliosController } from "./portfolios.controller";
import { Portfolio, PortfolioSchema } from "../../schemas/portfolio.schema";
import { Version, VersionSchema } from "../../schemas/content.schema";
import { User, UserSchema } from "../../schemas/user.schema";
import { EntitlementsService } from "../../services/entitlements.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Portfolio.name, schema: PortfolioSchema },
      { name: Version.name, schema: VersionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [PortfoliosController],
  providers: [PortfoliosService, EntitlementsService],
  exports: [PortfoliosService],
})
export class PortfoliosModule {}
