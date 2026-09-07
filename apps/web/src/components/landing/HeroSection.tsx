"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { HeroPortfolioPreview } from "./HeroPortfolioPreview";
import { NewsletterForm } from "./NewsletterForm";
import { landingCopy } from "./landingCopy";
import { ease, fadeUp, staggerContainer, usePrefersReducedMotion } from "./motion";
import styles from "./landing.module.css";

function HeadlineWords({ text, highlight }: { text: string; highlight: string }) {
  const parts = text.split(highlight);
  const before = parts[0] ?? "";
  const after = parts[1] ?? "";

  return (
    <>
      {before.split(" ").map((word, i) =>
        word ? (
          <motion.span
            key={`b-${i}`}
            className={styles.headlineWord}
            variants={fadeUp}
            transition={{ duration: 0.45, ease }}
            style={{ display: "inline-block", marginRight: "0.28em" }}
          >
            {word}
          </motion.span>
        ) : null,
      )}
      <motion.span
        className={`${styles.headlineWord} ${styles.headlineGradient}`}
        variants={fadeUp}
        transition={{ duration: 0.45, ease, delay: 0.06 }}
        style={{ display: "inline-block", marginRight: "0.28em" }}
      >
        {highlight}
      </motion.span>
      {after.split(" ").map((word, i) =>
        word ? (
          <motion.span
            key={`a-${i}`}
            className={styles.headlineWord}
            variants={fadeUp}
            transition={{ duration: 0.45, ease, delay: 0.08 + i * 0.04 }}
            style={{ display: "inline-block", marginRight: "0.28em" }}
          >
            {word}
          </motion.span>
        ) : null,
      )}
    </>
  );
}

export function HeroSection() {
  const reduced = usePrefersReducedMotion();
  const c = landingCopy.hero;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-6, 6]);

  return (
    <section className={styles.hero}>
      <div className={styles.heroBg}>
        <div className={reduced ? undefined : styles.heroKenBurns} style={{ position: "absolute", inset: 0 }}>
          <Image src="/student-with-books-bg.jpg" alt="" fill priority sizes="100vw" />
        </div>
      </div>
      <div className={styles.heroOverlay} />
      <motion.div
        className={styles.heroInner}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.heroContent}>
          <motion.div className={styles.heroBadge} variants={fadeUp} transition={{ duration: 0.5, ease }}>
            <Logo variant="icon" size="sm" animate={!reduced} />
            <span className={styles.heroBadgeText}>{landingCopy.tagline}</span>
          </motion.div>
          <motion.p className={styles.heroEyebrow} variants={fadeUp} transition={{ duration: 0.5, ease }}>
            {landingCopy.eyebrow}
          </motion.p>
          <motion.h1
            className={`display ${styles.heroTitle}`}
            variants={fadeUp}
            transition={{ duration: 0.5, ease }}
          >
            <HeadlineWords text={c.headline} highlight={c.headlineHighlight} />
          </motion.h1>
          <motion.p
            className={styles.heroLead}
            variants={fadeUp}
            transition={{ duration: 0.5, ease }}
          >
            {c.subhead}
          </motion.p>
          <motion.div className={styles.heroActions} variants={fadeUp} transition={{ duration: 0.5, ease }}>
            <Link href="/register" className="btn accent lg">
              {c.ctaPrimary}
            </Link>
            <Link href="/talent" className={`btn ghost lg ${styles.heroGhostBtn}`}>
              {c.ctaSecondary}
            </Link>
          </motion.div>
          <motion.div className={styles.heroTrust} variants={fadeUp} transition={{ duration: 0.5, ease }}>
            {c.trustRow.map((item, i) => (
              <span key={item}>
                {i > 0 && <span className={styles.heroTrustDot}> · </span>}
                {item}
              </span>
            ))}
          </motion.div>
          <motion.div className={styles.heroNewsletter} variants={fadeUp} transition={{ duration: 0.5, ease }}>
            <span className={styles.heroNewsletterLabel}>{landingCopy.about.newsletter.heroTeaser}</span>
            <NewsletterForm
              source="hero"
              inline
              placeholder={landingCopy.about.newsletter.placeholder}
              submitLabel={landingCopy.about.newsletter.submit}
              successMessage={landingCopy.about.newsletter.success}
            />
          </motion.div>
        </div>
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6, ease }}
          onMouseMove={
            reduced
              ? undefined
              : (e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  x.set((e.clientX - rect.left) / rect.width - 0.5);
                  y.set((e.clientY - rect.top) / rect.height - 0.5);
                }
          }
          onMouseLeave={() => {
            x.set(0);
            y.set(0);
          }}
          style={{ perspective: 1200 }}
        >
          <HeroPortfolioPreview
            style={
              reduced
                ? undefined
                : {
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                  }
            }
          />
        </motion.div>
      </motion.div>

      {!reduced && (
        <motion.div
          className={styles.heroScrollCue}
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          <span>Scroll</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>
      )}
    </section>
  );
}
