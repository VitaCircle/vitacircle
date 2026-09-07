"use client";

import { HeroSection } from "./HeroSection";
import { StatsStrip } from "./StatsStrip";
import { FeaturesGrid } from "./FeaturesGrid";
import { HowItWorks } from "./HowItWorks";
import { AiScoreDemo } from "./AiScoreDemo";
import { DisciplinesShowcase } from "./DisciplinesShowcase";
import { TemplatesShowcase } from "./TemplatesShowcase";
import { CareerOsSection } from "./CareerOsSection";
import { PricingSection } from "./PricingSection";
import { AudienceCTA } from "./AudienceCTA";
import { FaqSection } from "./FaqSection";
import { FinalCtaSection } from "./FinalCtaSection";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AosInit } from "./AosInit";
import { LandingDecor } from "./LandingDecor";
import styles from "./landing.module.css";

export function LandingPage() {
  return (
    <div className={styles.landingRoot}>
      <AosInit />
      <LandingDecor />
      <div className={styles.sectionInner}>
        <HeroSection />
        <StatsStrip />
        <div className={styles.sectionDivider} />
        <FeaturesGrid />
        <div className={styles.sectionDivider} />
        <HowItWorks />
        <AiScoreDemo />
        <DisciplinesShowcase />
        <TemplatesShowcase />
        <CareerOsSection />
        <PricingSection />
        <AudienceCTA />
        <FaqSection />
        <FinalCtaSection />
        <SiteFooter />
      </div>
    </div>
  );
}
