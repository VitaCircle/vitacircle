import { ForbiddenException, Injectable } from "@nestjs/common";
import { entitlementsFor, type Entitlements, type PlanId } from "@vitacircle/shared";
import type { AuthUser } from "../common/decorators/auth";

@Injectable()
export class EntitlementsService {
  forUser(user: AuthUser | { plan: string }): Entitlements {
    const plan = (user.plan as PlanId) || "free";
    return entitlementsFor(plan === "studio" || plan === "pro" ? plan : "free");
  }

  require(user: AuthUser, key: keyof Entitlements, expected: unknown = true) {
    const e = this.forUser(user);
    const value = e[key];
    if (typeof expected === "boolean" && expected && !value) {
      throw new ForbiddenException(`Upgrade required: ${key}`);
    }
    return e;
  }

  assertUnderLimit(current: number, max: number, label: string) {
    if (current >= max) {
      throw new ForbiddenException(`${label} limit reached for your plan`);
    }
  }
}
