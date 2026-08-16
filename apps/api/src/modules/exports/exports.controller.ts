import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ExportsService } from "./exports.service";
import { CurrentUser, type AuthUser } from "../../common/decorators/auth";

@Controller("exports")
export class ExportsController {
  constructor(private exports: ExportsService) {}

  @Post()
  start(@CurrentUser() user: AuthUser, @Body() body: { portfolioId: string; format: "pdf" | "docx" | "ats-pdf" }) {
    return this.exports.start(user, body.portfolioId, body.format);
  }

  @Get(":id")
  status(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.exports.status(user, id);
  }

  @Get(":id/download")
  download(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.exports.download(user, id);
  }
}
