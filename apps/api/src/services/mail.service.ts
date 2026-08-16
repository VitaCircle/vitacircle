import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

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
    this.log.log(`Would send SMTP email to ${to}: ${subject}`);
  }
}
