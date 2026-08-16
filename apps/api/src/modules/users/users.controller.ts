import { Body, Controller, Delete, Get, Patch, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CurrentUser, type AuthUser } from "../../common/decorators/auth";

@Controller("users")
export class UsersController {
  constructor(private users: UsersService) {}

  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    return this.users.me(user.userId);
  }

  @Patch("me")
  update(@CurrentUser() user: AuthUser, @Body() body: Record<string, unknown>) {
    return this.users.updateMe(user.userId, body);
  }

  @Get("me/export")
  export(@CurrentUser() user: AuthUser) {
    return this.users.exportData(user.userId);
  }

  @Delete("me")
  remove(@CurrentUser() user: AuthUser) {
    return this.users.deleteAccount(user.userId);
  }

  @Post("me/totp/setup")
  totpSetup(@CurrentUser() user: AuthUser) {
    return this.users.totpSetup(user.userId);
  }

  @Post("me/totp/enable")
  totpEnable(@CurrentUser() user: AuthUser, @Body() body: { code: string }) {
    return this.users.totpEnable(user.userId, body.code);
  }
}
