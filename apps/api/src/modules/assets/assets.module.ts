import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AssetsService } from "./assets.service";
import { AssetsController } from "./assets.controller";
import { Asset, AssetSchema } from "../../schemas/content.schema";
import { User, UserSchema } from "../../schemas/user.schema";
import { StorageService } from "../../services/storage.service";
import { ScanService } from "../../services/scan.service";
import { EntitlementsService } from "../../services/entitlements.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Asset.name, schema: AssetSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AssetsController],
  providers: [AssetsService, StorageService, ScanService, EntitlementsService],
  exports: [AssetsService],
})
export class AssetsModule {}
