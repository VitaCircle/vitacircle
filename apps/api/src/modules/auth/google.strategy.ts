import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(config: ConfigService) {
    const id = config.get<string>("GOOGLE_CLIENT_ID") || "disabled";
    const secret = config.get<string>("GOOGLE_CLIENT_SECRET") || "disabled";
    super({
      clientID: id,
      clientSecret: secret,
      callbackURL: config.get("GOOGLE_CALLBACK_URL") || "http://localhost:4000/auth/google/callback",
      scope: ["email", "profile"],
    });
  }

  validate(_access: string, _refresh: string, profile: { id: string; emails?: { value: string }[]; displayName?: string }) {
    return {
      id: profile.id,
      email: profile.emails?.[0]?.value || "",
      name: profile.displayName,
    };
  }
}
