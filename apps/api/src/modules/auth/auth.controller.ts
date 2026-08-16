import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "../../common/decorators/auth";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";
import { Request, Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";

class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  username?: string;
}

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  totp?: string;
}

@Controller("auth")
export class AuthController {
  constructor(
    private auth: AuthService,
    private config: ConfigService,
  ) {}

  @Public()
  @Post("register")
  register(@Body() body: RegisterDto) {
    return this.auth.register(body.email, body.password, body.username);
  }

  @Public()
  @Post("login")
  async login(@Body() body: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.login(body.email, body.password, body.totp, {
      ua: req.headers["user-agent"],
      ip: req.ip,
    });
    this.auth.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, user: tokens.user };
  }

  @Public()
  @Post("refresh")
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = (req.cookies?.refresh_token as string) || "";
    const tokens = await this.auth.refresh(token, { ua: req.headers["user-agent"], ip: req.ip });
    this.auth.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, user: tokens.user };
  }

  @Public()
  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req.cookies?.refresh_token);
    res.clearCookie("refresh_token", { path: "/auth" });
    return { ok: true };
  }

  @Public()
  @Get("verify")
  verify(@Query("token") token: string) {
    return this.auth.verifyEmail(token);
  }

  @Public()
  @Post("forgot")
  forgot(@Body() body: { email: string }) {
    return this.auth.forgot(body.email);
  }

  @Public()
  @Post("reset")
  reset(@Body() body: { token: string; password: string }) {
    return this.auth.reset(body.token, body.password);
  }

  @Public()
  @Get("google")
  @UseGuards(AuthGuard("google"))
  google() {
    return;
  }

  @Public()
  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleCb(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.auth.oauthUpsert("google", req.user as { id: string; email: string; name?: string });
    this.auth.setRefreshCookie(res, tokens.refreshToken);
    const app = this.config.get("APP_URL") || "http://localhost:3000";
    res.redirect(`${app}/oauth/callback#access=${tokens.accessToken}`);
  }

  @Public()
  @Get("linkedin")
  @UseGuards(AuthGuard("linkedin"))
  linkedin() {
    return;
  }

  @Public()
  @Get("linkedin/callback")
  @UseGuards(AuthGuard("linkedin"))
  async linkedinCb(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.auth.oauthUpsert("linkedin", req.user as { id: string; email: string; name?: string });
    this.auth.setRefreshCookie(res, tokens.refreshToken);
    const app = this.config.get("APP_URL") || "http://localhost:3000";
    res.redirect(`${app}/oauth/callback#access=${tokens.accessToken}`);
  }
}
