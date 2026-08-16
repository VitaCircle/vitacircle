import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC } from "../decorators/auth";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwt: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    const req = context.switchToHttp().getRequest();
    const header = (req.headers.authorization as string | undefined) ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : req.cookies?.access_token;
    if (!token) {
      if (isPublic) return true;
      throw new UnauthorizedException("Authentication required");
    }
    try {
      req.user = this.jwt.verify(token);
      return true;
    } catch {
      if (isPublic) {
        req.user = undefined;
        return true;
      }
      throw new UnauthorizedException("Authentication required");
    }
  }
}
