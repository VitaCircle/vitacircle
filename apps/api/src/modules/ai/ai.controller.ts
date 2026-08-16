import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AiService } from "./ai.service";
import { CurrentUser, type AuthUser } from "../../common/decorators/auth";

@Controller("ai")
export class AiController {
  constructor(private ai: AiService) {}

  @Post("score")
  score(
    @CurrentUser() user: AuthUser,
    @Body() body: { portfolioId: string; targetRole?: string; jobDescription?: string },
  ) {
    return this.ai.score(user, body.portfolioId, body.targetRole, body.jobDescription);
  }

  @Post("tailor")
  tailor(@CurrentUser() user: AuthUser, @Body() body: { portfolioId: string; jobDescription: string }) {
    return this.ai.tailor(user, body.portfolioId, body.jobDescription);
  }

  @Post("rewrite")
  rewrite(@CurrentUser() user: AuthUser, @Body() body: { text: string; instruction: string }) {
    return this.ai.rewrite(user, body.text, body.instruction);
  }

  @Get("history/:portfolioId")
  history(@CurrentUser() user: AuthUser, @Param("portfolioId") portfolioId: string) {
    return this.ai.history(user, portfolioId);
  }
}
