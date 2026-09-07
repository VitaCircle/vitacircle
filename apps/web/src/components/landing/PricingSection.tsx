"use client";

import Link from "next/link";
import { PLAN_ENTITLEMENTS } from "@vitacircle/shared";
import { landingCopy } from "./landingCopy";
import styles from "./landing.module.css";

function formatStorage(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${bytes / (1024 * 1024 * 1024)}GB`;
  return `${bytes / (1024 * 1024)}MB`;
}

const PLAN_FEATURES = {
  free: [
    `${PLAN_ENTITLEMENTS.free.maxPortfolios} portfolio`,
    `${PLAN_ENTITLEMENTS.free.maxTemplates} templates`,
    `${formatStorage(PLAN_ENTITLEMENTS.free.storageBytes)} storage`,
    `${PLAN_ENTITLEMENTS.free.aiScoresPerMonth} AI scores/month`,
    "PNG, JPEG, MP3 media",
  ],
  pro: [
    "Unlimited portfolios",
    "All templates + video",
    `${formatStorage(PLAN_ENTITLEMENTS.pro.storageBytes)} storage`,
    "Unlimited AI scores",
    "Custom domain & analytics",
    "ATS export & job tailor",
    `${PLAN_ENTITLEMENTS.pro.collabSeats} collab seats`,
  ],
  studio: [
    "Org & education seats",
    "SSO & branded templates",
    `${PLAN_ENTITLEMENTS.studio.collabSeats} collab seats`,
    "Priority support",
    "Volume pricing",
  ],
} as const;

export function PricingSection() {
  const c = landingCopy.pricing;
  const plans = [
    { id: "free" as const, ...c.plans.free, featured: false },
    { id: "pro" as const, ...c.plans.pro, featured: true },
    { id: "studio" as const, ...c.plans.studio, featured: false },
  ];

  return (
    <section id="pricing" className={`${styles.section} container`}>
      <div className={`${styles.sectionHeader} ${styles.sectionHeaderCenter}`} data-aos="fade-up">
        <p className={styles.eyebrow}>{c.eyebrow}</p>
        <h2 className={styles.sectionTitle}>{c.title}</h2>
      </div>
      <div className={styles.pricingGrid}>
        {plans.map((plan, i) => (
          <article
            key={plan.id}
            className={`${styles.pricingCard} ${plan.featured ? styles.pricingCardFeatured : ""} ${styles.glassCard}`}
            data-aos="fade-up"
            data-aos-delay={i * 100}
          >
            <h3 style={{ margin: 0, fontSize: 20 }}>{plan.name}</h3>
            <div className={styles.pricingPrice}>
              {plan.price}
              <span className={styles.pricingPeriod}> {plan.period}</span>
            </div>
            <ul className={styles.pricingFeatures}>
              {PLAN_FEATURES[plan.id].map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <Link href={plan.id === "studio" ? "/about#contact" : "/register"} className={`btn lg ${plan.featured ? "accent" : "ghost"}`}>
              {plan.id === "studio" ? "Contact us" : "Get started"}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
