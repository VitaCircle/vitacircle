import { Injectable, NotFoundException, StreamableFile, ForbiddenException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import { ExportJob, ExportJobDocument } from "../../schemas/content.schema";
import { Portfolio, PortfolioDocument } from "../../schemas/portfolio.schema";
import { StorageService } from "../../services/storage.service";
import { EntitlementsService } from "../../services/entitlements.service";
import { SRS_MESSAGES, type DraftTree, type Block } from "@vitacircle/shared";
import type { AuthUser } from "../../common/decorators/auth";
import { randomUUID } from "crypto";

function blockLines(block: Block): string[] {
  const d = block.data as Record<string, unknown>;
  switch (block.type) {
    case "hero":
      return [String(d.name || ""), String(d.headline || ""), String(d.location || "")].filter(Boolean);
    case "about":
      return [String(d.body || "")];
    case "project":
      return [`${d.title || "Project"}`, `Problem: ${d.problem || ""}`, `Role: ${d.role || ""}`, `Outcome: ${d.outcome || ""}`];
    case "skills":
      return [`Skills: ${((d.items as string[]) || []).join(", ")}`];
    case "contact":
      return [String(d.email || ""), String(d.website || ""), String(d.linkedin || "")].filter(Boolean);
    case "experience":
      return ((d.items as { org?: string; role?: string; summary?: string }[]) || []).map(
        (i) => `${i.role || ""} — ${i.org || ""}\n${i.summary || ""}`,
      );
    case "education":
      return ((d.items as { school?: string; credential?: string }[]) || []).map(
        (i) => `${i.credential || ""} — ${i.school || ""}`,
      );
    default:
      return [JSON.stringify(d)];
  }
}

@Injectable()
export class ExportsService {
  constructor(
    @InjectModel(ExportJob.name) private jobs: Model<ExportJobDocument>,
    @InjectModel(Portfolio.name) private portfolios: Model<PortfolioDocument>,
    private storage: StorageService,
    private entitlements: EntitlementsService,
  ) {}

  async start(user: AuthUser, portfolioId: string, format: "pdf" | "docx" | "ats-pdf") {
    const e = this.entitlements.forUser(user);
    if (format === "ats-pdf" && !e.atsExport) throw new ForbiddenException("ATS export is a Pro feature");
    const p = await this.portfolios.findOne({ _id: portfolioId, ownerId: user.userId });
    if (!p) throw new NotFoundException();
    const job = await this.jobs.create({
      portfolioId: p._id,
      ownerId: user.userId,
      format,
      status: "running",
      expiresAt: new Date(Date.now() + 86400000),
    });
    try {
      const buf = format === "docx" ? await this.toDocx(p) : await this.toPdf(p, format === "ats-pdf" || e.watermarkPdf);
      const key = `exports/${user.userId}/${job.id}.${format === "docx" ? "docx" : "pdf"}`;
      await this.storage.putFile(key, buf);
      job.storageKey = key;
      job.status = "ready";
      await job.save();
      return { id: job.id, status: job.status, message: SRS_MESSAGES.exportSuccess, downloadPath: `/exports/${job.id}/download` };
    } catch (err) {
      job.status = "failed";
      job.error = err instanceof Error ? err.message : "export failed";
      await job.save();
      throw err;
    }
  }

  async download(user: AuthUser, id: string) {
    const job = await this.jobs.findOne({ _id: id, ownerId: user.userId, status: "ready" });
    if (!job?.storageKey) throw new NotFoundException();
    return new StreamableFile(this.storage.createReadStream(job.storageKey));
  }

  async status(user: AuthUser, id: string) {
    const job = await this.jobs.findOne({ _id: id, ownerId: user.userId });
    if (!job) throw new NotFoundException();
    return job;
  }

  private async toPdf(p: PortfolioDocument, watermark: boolean): Promise<Buffer> {
    const draft = (p.publishedSnapshot || p.draft) as DraftTree;
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 56, size: "LETTER" });
      const chunks: Buffer[] = [];
      doc.on("data", (c) => chunks.push(c as Buffer));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      doc.fontSize(22).text(p.title, { align: "left" });
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor("#6B6560").text(p.vertical.replace("_", " "));
      doc.moveDown();
      doc.fillColor("#1A1916");
      for (const block of draft.blocks || []) {
        doc.fontSize(13).text(block.type.toUpperCase());
        doc.moveDown(0.2);
        doc.fontSize(11);
        for (const line of blockLines(block)) {
          if (line.trim()) doc.text(line, { lineGap: 3 });
        }
        doc.moveDown();
      }
      if (watermark) {
        doc.fontSize(9).fillColor("#C45C26").text("Prepared with VitaCircle — vitacircle.app", 56, 740);
      }
      doc.end();
    });
  }

  private async toDocx(p: PortfolioDocument): Promise<Buffer> {
    const draft = (p.publishedSnapshot || p.draft) as DraftTree;
    const children = [
      new Paragraph({ text: p.title, heading: HeadingLevel.TITLE }),
      new Paragraph({ children: [new TextRun({ text: "Word export is a linear mapping of sections; layout is simpler than the live site.", italics: true, size: 18 })] }),
    ];
    for (const block of draft.blocks || []) {
      children.push(new Paragraph({ text: block.type, heading: HeadingLevel.HEADING_2 }));
      for (const line of blockLines(block)) {
        children.push(new Paragraph(line));
      }
    }
    const doc = new Document({ sections: [{ children }] });
    return Buffer.from(await Packer.toBuffer(doc));
  }
}
