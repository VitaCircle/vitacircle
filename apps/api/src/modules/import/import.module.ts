import { Module } from "@nestjs/common";
import { ImportController } from "./import.controller";
import { PortfoliosModule } from "../portfolios/portfolios.module";

@Module({
  imports: [PortfoliosModule],
  controllers: [ImportController],
})
export class ImportModule {}
