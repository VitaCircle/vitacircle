"use client";

import { AI_RUBRIC_WEIGHTS } from "@vitacircle/shared";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { landingCopy } from "./landingCopy";
import { ease, useCountUp } from "./motion";
import styles from "./landing.module.css";

const RUBRIC_SAMPLE: Record<keyof typeof AI_RUBRIC_WEIGHTS, number> = {
  relevance: 88,
  evidence: 85,
  craft: 90,
  completeness: 82,
  clarity: 86,
};

const RUBRIC_LABELS: Record<keyof typeof AI_RUBRIC_WEIGHTS, string> = {
  relevance: "Relevance",
  evidence: "Evidence",
  craft: "Craft",
  completeness: "Completeness",
  clarity: "Clarity",
};

export function AiScoreDemo() {
  const c = landingCopy.aiDemo;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const score = useCountUp(c.sampleScore, inView);

  const circumference = 2 * Math.PI * 88;
  const offset = circumference - (score / 100) * circumference;

  return (
    <section className={`${styles.section} container`} ref={ref}>
      <div className={styles.aiGrid}>
        <div data-aos="fade-right">
          <p className={styles.eyebrow}>{c.eyebrow}</p>
          <h2 className={styles.sectionTitle}>{c.title}</h2>
          <p className={styles.sectionBody}>{c.body}</p>
        </div>
        <div className={`${styles.glassCard}`} style={{ padding: 32, borderRadius: 16 }} data-aos="fade-left" data-aos-duration="1000">
          <div className={styles.scoreRing}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="88" fill="none" stroke="var(--line)" strokeWidth="12" />
              <motion.circle
                cx="100"
                cy="100"
                r="88"
                fill="none"
                stroke="url(#scoreGrad)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: inView ? offset : circumference }}
                transition={{ duration: 1.4, ease }}
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--accent)" />
                  <stop offset="100%" stopColor="var(--accent-secondary)" />
                </linearGradient>
              </defs>
            </svg>
            <div className={styles.scoreRingValue}>{score}</div>
          </div>
          <div className={styles.rubricBars} style={{ marginTop: 32 }}>
            {(Object.keys(AI_RUBRIC_WEIGHTS) as (keyof typeof AI_RUBRIC_WEIGHTS)[]).map((key, i) => (
              <div key={key} className={styles.rubricRow} data-aos="fade-left" data-aos-delay={i * 60}>
                <span>{RUBRIC_LABELS[key]}</span>
                <div className={styles.rubricBar}>
                  <motion.div
                    className={styles.rubricFill}
                    initial={{ width: 0 }}
                    animate={{ width: inView ? `${RUBRIC_SAMPLE[key]}%` : 0 }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.08, ease }}
                  />
                </div>
                <span style={{ color: "var(--muted)", fontSize: 13 }}>{AI_RUBRIC_WEIGHTS[key]}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
