import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  NotificationsController,
  ApplicationsController,
  OrgsController,
  TalentController,
  RecruiterController,
  PublicApiController,
  CollabController,
  ModerationPublicController,
  PlatformPublicController,
} from "./platform.controllers";
import {
  Notification,
  NotificationSchema,
  JobApplication,
  JobApplicationSchema,
  Inquiry,
  InquirySchema,
  Organization,
  OrganizationSchema,
  OrgInvite,
  OrgInviteSchema,
  ApiKey,
  ApiKeySchema,
  Comment,
  CommentSchema,
  ModerationReport,
  ModerationReportSchema,
} from "../../schemas/ops.schema";
import { Portfolio, PortfolioSchema } from "../../schemas/portfolio.schema";
import { User, UserSchema } from "../../schemas/user.schema";
import { NewsletterSubscriber, NewsletterSubscriberSchema } from "../../schemas/newsletter.schema";
import { EntitlementsService } from "../../services/entitlements.service";
import { MailService } from "../../services/mail.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: JobApplication.name, schema: JobApplicationSchema },
      { name: Inquiry.name, schema: InquirySchema },
      { name: Organization.name, schema: OrganizationSchema },
      { name: OrgInvite.name, schema: OrgInviteSchema },
      { name: ApiKey.name, schema: ApiKeySchema },
      { name: Comment.name, schema: CommentSchema },
      { name: ModerationReport.name, schema: ModerationReportSchema },
      { name: Portfolio.name, schema: PortfolioSchema },
      { name: User.name, schema: UserSchema },
      { name: NewsletterSubscriber.name, schema: NewsletterSubscriberSchema },
    ]),
  ],
  controllers: [
    NotificationsController,
    ApplicationsController,
    OrgsController,
    TalentController,
    RecruiterController,
    PublicApiController,
    CollabController,
    ModerationPublicController,
    PlatformPublicController,
  ],
  providers: [EntitlementsService, MailService],
})
export class PlatformModule {}
