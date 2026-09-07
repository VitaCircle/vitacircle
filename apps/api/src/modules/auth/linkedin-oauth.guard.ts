import { ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class LinkedInOAuthGuard extends AuthGuard("linkedin") {
  constructor(private config: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (!this.config.get("LINKEDIN_CLIENT_ID")) {
      throw new NotFoundException("LinkedIn sign-in is not configured");
    }
    return super.canActivate(context);
  }
}
