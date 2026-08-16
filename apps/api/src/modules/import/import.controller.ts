import { Body, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { CurrentUser, type AuthUser } from "../../common/decorators/auth";
import { PortfoliosService } from "../portfolios/portfolios.service";

@Controller("import")
export class ImportController {
  constructor(private portfolios: PortfoliosService) {}

  @Post("linkedin")
  async linkedin(@CurrentUser() user: AuthUser, @Body() body: { headline?: string; about?: string; experience?: { org: string; role: string; summary: string }[] }) {
    const p = await this.portfolios.create(user, { title: "Imported from LinkedIn", vertical: "ux_ui", templateId: "atelier-ux" });
    const draft = p.draft as { blocks: { type: string; data: Record<string, unknown> }[] };
    const hero = draft.blocks.find((b) => b.type === "hero");
    const about = draft.blocks.find((b) => b.type === "about");
    const exp = draft.blocks.find((b) => b.type === "experience");
    if (hero) hero.data.headline = body.headline || hero.data.headline;
    if (about) about.data.body = body.about || "";
    if (exp) {
      exp.data.items = (body.experience || []).map((e, i) => ({ id: `imp-${i}`, ...e, start: "", summary: e.summary }));
    }
    return this.portfolios.updateDraft(user, p.id, draft, p.title);
  }

  @Post("file")
  @UseInterceptors(FileInterceptor("file", { storage: memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } }))
  async file(@CurrentUser() user: AuthUser, @UploadedFile() file: Express.Multer.File) {
    const text = file?.buffer?.toString("utf8") || "";
    const excerpt = text.replace(/[^\x09\x0a\x0d\x20-\x7e]/g, " ").slice(0, 1500);
    const p = await this.portfolios.create(user, { title: file?.originalname || "Imported resume", vertical: "writing" });
    const draft = p.draft as { blocks: { type: string; data: Record<string, unknown> }[] };
    const about = draft.blocks.find((b) => b.type === "about");
    if (about) about.data.body = excerpt || "Paste cleaned resume text into About and Projects. PDF binary import extracts a rough text preview.";
    return this.portfolios.updateDraft(user, p.id, draft, p.title);
  }
}
