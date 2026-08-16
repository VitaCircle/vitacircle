import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-linkedin-oauth2";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, "linkedin") {
  constructor(config: ConfigService) {
    super({
      clientID: config.get("LINKEDIN_CLIENT_ID") || "disabled",
      clientSecret: config.get("LINKEDIN_CLIENT_SECRET") || "disabled",
      callbackURL: config.get("LINKEDIN_CALLBACK_URL") || "http://localhost:4000/auth/linkedin/callback",
      scope: ["r_emailaddress", "r_liteprofile"],
    });
  }

  validate(_a: string, _r: string, profile: { id: string; emails?: { value: string }[]; displayName?: string }) {
    return {
      id: profile.id,
      email: profile.emails?.[0]?.value || "",
      name: profile.displayName,
    };
  }
}
