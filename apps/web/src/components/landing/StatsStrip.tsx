"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";
import { landingCopy } from "./landingCopy";
import { ease, useCountUp } from "./motion";
import styles from "./landing.module.css";

function StatItem({ label, value, suffix, delay }: { label: string; value: number; suffix: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const count = useCountUp(value, inView);

  return (
    <div
      ref={ref}
      className={`${styles.statCard} ${styles.glassCard}`}
      data-aos="zoom-in"
      data-aos-delay={delay}
    >
      <div className={styles.statValue}>
        {count}
        {suffix}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

export function StatsStrip() {
  return (
    <div className={styles.statsGrid}>
      {landingCopy.stats.map((s, i) => (
        <StatItem key={s.label} label={s.label} value={s.value} suffix={s.suffix} delay={i * 80} />
      ))}
    </div>
  );
}
