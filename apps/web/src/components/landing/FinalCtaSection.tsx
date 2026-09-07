"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { landingCopy } from "./landingCopy";
import { ease, fadeUp } from "./motion";
import styles from "./landing.module.css";

export function FinalCtaSection() {
  const c = landingCopy.finalCta;

  return (
    <motion.section
      className={styles.finalCta}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease }}
    >
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
        <div className={styles.finalCtaLogo}>
          <Logo size="lg" light animate />
        </div>
        <h2>{c.title}</h2>
        <p>{c.body}</p>
        <Link href="/register" className="btn accent lg">
          {c.cta}
        </Link>
      </motion.div>
    </motion.section>
  );
}
