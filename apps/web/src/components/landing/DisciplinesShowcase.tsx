"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { VERTICAL_LABELS } from "@vitacircle/shared";
import { landingCopy } from "./landingCopy";
import { VerticalIcon } from "./verticalIcons";
import { VERTICAL_META } from "./verticalMeta";
import styles from "./landing.module.css";

const sizeClass: Record<string, string> = {
  featured: styles.bentoFeatured,
  wide: styles.bentoWide,
  tall: styles.bentoTall,
  default: "",
};

export function DisciplinesShowcase() {
  const c = landingCopy.disciplines;

  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className="container">
        <div className={`${styles.sectionHeader} ${styles.sectionHeaderCenter}`} data-aos="fade-up">
          <p className={styles.eyebrow}>{c.eyebrow}</p>
          <h2 className={styles.sectionTitle}>{c.title}</h2>
          <p className={styles.sectionBody}>{c.body}</p>
        </div>
        <div className={styles.bentoGrid}>
          {VERTICAL_META.map((item, i) => (
            <motion.article
              key={item.vertical}
              className={`${styles.bentoCard} ${sizeClass[item.bentoSize] ?? ""}`}
              data-aos="fade-up"
              data-aos-delay={i * 60}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
            >
              {item.image ? (
                <div className={styles.bentoImage}>
                  <Image src={item.image} alt="" fill sizes="(max-width: 900px) 100vw, 25vw" />
                  <div className={styles.bentoImageOverlay} />
                </div>
              ) : (
                <div className={styles.bentoGradient} style={{ background: item.accent }} />
              )}
              <div className={styles.bentoContent}>
                <span className={styles.verticalIconWrap}>
                  <VerticalIcon vertical={item.vertical} size={26} className={styles.verticalIconSvg} />
                </span>
                <h3 className={styles.bentoTitle}>{VERTICAL_LABELS[item.vertical]}</h3>
                <p className={styles.bentoTagline}>{item.tagline}</p>
                <div className={styles.blockChips}>
                  {item.blocks.map((b) => (
                    <span key={b} className={styles.blockChip}>
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
