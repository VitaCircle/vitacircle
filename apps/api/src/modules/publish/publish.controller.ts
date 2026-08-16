import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { PublishService } from "./publish.service";
import { CurrentUser, Public, type AuthUser } from "../../common/decorators/auth";

@Controller()
export class PublishController {
  constructor(private publish: PublishService) {}

  @Post("portfolios/:id/publish")
  publishOne(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() body: { slug?: string; password?: string },
  ) {
    return this.publish.publish(user, id, body);
  }

  @Post("portfolios/:id/unpublish")
  unpublish(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.publish.unpublish(user, id);
  }

  @Public()
  @Get("public/:username/:slug")
  publicGet(@Param("username") username: string, @Param("slug") slug: string) {
    return this.publish.publicBySlug(username, slug);
  }

  @Public()
  @Post("public/:username/:slug/unlock")
  unlock(
    @Param("username") username: string,
    @Param("slug") slug: string,
    @Body() body: { password?: string },
  ) {
    return this.publish.publicBySlug(username, slug, body.password);
  }

  @Post("domains")
  domain(@CurrentUser() user: AuthUser, @Body() body: { portfolioId: string; host: string }) {
    return this.publish.requestDomain(user, body.portfolioId, body.host);
  }

  @Post("domains/verify")
  verify(@CurrentUser() user: AuthUser, @Body() body: { host: string }) {
    return this.publish.verifyDomain(user, body.host);
  }
}
