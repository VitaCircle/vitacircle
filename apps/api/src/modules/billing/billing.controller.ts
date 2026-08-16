import { BadRequestException, Controller, Get, Headers, Post, RawBodyRequest, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { Request } from "express";
import { Subscription, SubscriptionDocument, StripeEvent, StripeEventDocument, Notification } from "../../schemas/ops.schema";
import { User, UserDocument } from "../../schemas/user.schema";
import { CurrentUser, Public, type AuthUser } from "../../common/decorators/auth";
import { entitlementsFor, type PlanId } from "@vitacircle/shared";

@Controller("billing")
export class BillingController {
  private stripe: Stripe | null;

  constructor(
    @InjectModel(Subscription.name) private subs: Model<SubscriptionDocument>,
    @InjectModel(StripeEvent.name) private events: Model<StripeEventDocument>,
    @InjectModel(User.name) private users: Model<UserDocument>,
    @InjectModel(Notification.name) private notes: Model<Notification>,
    private config: ConfigService,
  ) {
    const key = this.config.get("STRIPE_SECRET_KEY");
    this.stripe = key ? new Stripe(key) : null;
  }

  @Get("entitlements")
  entitlements(@CurrentUser() user: AuthUser) {
    const plan = (user.plan as PlanId) || "free";
    return { plan, entitlements: entitlementsFor(plan === "studio" || plan === "pro" ? plan : "free") };
  }

  @Post("checkout")
  async checkout(@CurrentUser() user: AuthUser, @Req() req: { body: { interval?: string } }) {
    if (!this.stripe) {
      await this.users.updateOne({ _id: user.userId }, { plan: "pro" });
      await this.subs.findOneAndUpdate(
        { userId: user.userId },
        { status: "active", plan: "pro", currentPeriodEnd: new Date(Date.now() + 30 * 86400000) },
        { upsert: true },
      );
      return { url: null, mocked: true, plan: "pro", note: "Stripe keys unset — granted Pro in development." };
    }
    const price =
      req.body.interval === "year"
        ? this.config.get("STRIPE_PRICE_PRO_ANNUAL")
        : this.config.get("STRIPE_PRICE_PRO_MONTHLY");
    if (!price) throw new BadRequestException("Stripe price not configured");
    const u = await this.users.findById(user.userId);
    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: u?.email,
      line_items: [{ price, quantity: 1 }],
      success_url: `${this.config.get("APP_URL")}/app/billing?ok=1`,
      cancel_url: `${this.config.get("APP_URL")}/app/billing?canceled=1`,
      metadata: { userId: user.userId },
    });
    return { url: session.url };
  }

  @Post("portal")
  async portal(@CurrentUser() user: AuthUser) {
    if (!this.stripe) return { url: null, mocked: true };
    const u = await this.users.findById(user.userId);
    if (!u?.stripeCustomerId) throw new BadRequestException("No Stripe customer");
    const session = await this.stripe.billingPortal.sessions.create({
      customer: u.stripeCustomerId,
      return_url: `${this.config.get("APP_URL")}/app/billing`,
    });
    return { url: session.url };
  }

  @Public()
  @Post("webhook")
  async webhook(@Headers("stripe-signature") sig: string, @Req() req: RawBodyRequest<Request>) {
    if (!this.stripe) return { received: true, skipped: true };
    const secret = this.config.get("STRIPE_WEBHOOK_SECRET");
    if (!secret) throw new BadRequestException("Webhook secret missing");
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(req.rawBody as Buffer, sig, secret);
    } catch {
      throw new BadRequestException("Invalid Stripe signature");
    }
    const seen = await this.events.findOne({ eventId: event.id });
    if (seen) return { received: true, duplicate: true };
    await this.events.create({ eventId: event.id, type: event.type });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId) {
        await this.users.updateOne({ _id: userId }, { plan: "pro", stripeCustomerId: session.customer });
        await this.subs.findOneAndUpdate(
          { userId },
          { status: "active", plan: "pro", stripeCustomerId: session.customer, stripeSubscriptionId: session.subscription },
          { upsert: true },
        );
        await this.notes.create({ userId, title: "Pro is active", body: "Your VitaCircle Pro subscription is live." });
      }
    }
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const sub = await this.subs.findOne({ stripeCustomerId: invoice.customer });
      if (sub) {
        sub.dunningAttempts += 1;
        sub.status = "past_due";
        await sub.save();
        await this.notes.create({
          userId: sub.userId,
          title: "Payment failed",
          body: "Update your card to keep Pro features.",
          href: "/app/billing",
        });
        if (sub.dunningAttempts >= 3) {
          await this.users.updateOne({ _id: sub.userId }, { plan: "free" });
          sub.plan = "free";
          sub.status = "canceled";
          await sub.save();
        }
      }
    }
    if (event.type === "customer.subscription.deleted") {
      const stripeSub = event.data.object as Stripe.Subscription;
      const sub = await this.subs.findOne({ stripeSubscriptionId: stripeSub.id });
      if (sub) {
        await this.users.updateOne({ _id: sub.userId }, { plan: "free" });
        sub.status = "canceled";
        sub.plan = "free";
        await sub.save();
      }
    }
    return { received: true };
  }
}
