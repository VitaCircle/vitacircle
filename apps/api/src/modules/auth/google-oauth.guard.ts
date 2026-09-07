import { ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GoogleOAuthGuard extends AuthGuard("google") {
  constructor(private config: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (!this.config.get("GOOGLE_CLIENT_ID")) {
      throw new NotFoundException("Google sign-in is not configured");
    }
    return super.canActivate(context);
  }
}
