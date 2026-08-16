import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { PortfoliosService } from "./portfolios.service";
import { CurrentUser, Public, type AuthUser } from "../../common/decorators/auth";

@Controller("portfolios")
export class PortfoliosController {
  constructor(private portfolios: PortfoliosService) {}

  @Public()
  @Get("templates")
  templates() {
    return this.portfolios.templates();
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.portfolios.list(user);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() body: { title?: string; vertical?: string; templateId?: string }) {
    return this.portfolios.create(user, body);
  }

  @Get(":id")
  get(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.portfolios.getOwned(user, id);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() body: { draft?: unknown; title?: string; targetRole?: string },
  ) {
    return this.portfolios.updateDraft(user, id, body.draft, body.title, body.targetRole);
  }

  @Post(":id/duplicate")
  duplicate(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.portfolios.duplicate(user, id);
  }

  @Delete(":id")
  archive(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.portfolios.archive(user, id);
  }

  @Get(":id/versions")
  versions(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.portfolios.listVersions(user, id);
  }

  @Post(":id/versions/:versionId/restore")
  restore(@CurrentUser() user: AuthUser, @Param("id") id: string, @Param("versionId") versionId: string) {
    return this.portfolios.restoreVersion(user, id, versionId);
  }

  @Post(":id/apply-suggestion")
  apply(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() body: { blockId: string; field: string; proposed: string },
  ) {
    return this.portfolios.applySuggestion(user, id, body.blockId, body.field, body.proposed);
  }
}
