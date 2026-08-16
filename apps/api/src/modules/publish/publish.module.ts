import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PublishService } from "./publish.service";
import { PublishController } from "./publish.controller";
import { Portfolio, PortfolioSchema } from "../../schemas/portfolio.schema";
import { User, UserSchema } from "../../schemas/user.schema";
import { CustomDomain, CustomDomainSchema } from "../../schemas/ops.schema";
import { EntitlementsService } from "../../services/entitlements.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Portfolio.name, schema: PortfolioSchema },
      { name: User.name, schema: UserSchema },
      { name: CustomDomain.name, schema: CustomDomainSchema },
    ]),
  ],
  controllers: [PublishController],
  providers: [PublishService, EntitlementsService],
  exports: [PublishService],
})
export class PublishModule {}
