import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private readonly log = new Logger(MailService.name);

  constructor(private config: ConfigService) {}

  async send(to: string, subject: string, body: string) {
    const host = this.config.get("SMTP_HOST");
    if (!host) {
      this.log.log(`[dev email] to=${to} subject=${subject}\n${body}`);
      return;
    }
    const port = Number(this.config.get("SMTP_PORT") || 1025);
    const user = this.config.get("SMTP_USER");
    const pass = this.config.get("SMTP_PASS");
    const secure = this.config.get("SMTP_SECURE") === "true";
    const from = this.config.get("EMAIL_FROM") || "VitaCircle <noreply@vitacircle.local>";
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    await transporter.sendMail({
      from,
      to,
      subject,
      text: body,
    });
    this.log.log(`Sent email to ${to}: ${subject}`);
  }
}
