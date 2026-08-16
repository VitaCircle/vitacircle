import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { User, UserSchema } from "../../schemas/user.schema";
import { Portfolio, PortfolioSchema } from "../../schemas/portfolio.schema";
import { Asset, AssetSchema } from "../../schemas/content.schema";
import { Session, SessionSchema } from "../../schemas/session.schema";
import { AuthModule } from "../auth/auth.module";
import { StorageService } from "../../services/storage.service";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Portfolio.name, schema: PortfolioSchema },
      { name: Asset.name, schema: AssetSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, StorageService],
  exports: [UsersService],
})
export class UsersModule {}
