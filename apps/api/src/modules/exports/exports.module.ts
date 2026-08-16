import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ExportsService } from "./exports.service";
import { ExportsController } from "./exports.controller";
import { ExportJob, ExportJobSchema, Asset, AssetSchema } from "../../schemas/content.schema";
import { Portfolio, PortfolioSchema } from "../../schemas/portfolio.schema";
import { StorageService } from "../../services/storage.service";
import { EntitlementsService } from "../../services/entitlements.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExportJob.name, schema: ExportJobSchema },
      { name: Portfolio.name, schema: PortfolioSchema },
      { name: Asset.name, schema: AssetSchema },
    ]),
  ],
  controllers: [ExportsController],
  providers: [ExportsService, StorageService, EntitlementsService],
})
export class ExportsModule {}
