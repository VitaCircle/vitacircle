import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BillingController } from "./billing.controller";
import { Subscription, SubscriptionSchema, StripeEvent, StripeEventSchema, Notification, NotificationSchema } from "../../schemas/ops.schema";
import { User, UserSchema } from "../../schemas/user.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: StripeEvent.name, schema: StripeEventSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [BillingController],
})
export class BillingModule {}
