"use client";

import Link from "next/link";
import { landingCopy } from "./landingCopy";
import styles from "./landing.module.css";

export function AudienceCTA() {
  const c = landingCopy.audience;

  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className="container">
        <div className={`${styles.sectionHeader} ${styles.sectionHeaderCenter}`} data-aos="fade-up">
          <p className={styles.eyebrow}>{c.eyebrow}</p>
          <h2 className={styles.sectionTitle}>{c.title}</h2>
        </div>
        <div className={styles.audienceGrid}>
          {c.cards.map((card, i) => (
            <article
              key={card.title}
              className={`${styles.audienceCard} ${styles.glassCard}`}
              data-aos="fade-up"
              data-aos-delay={i * 120}
            >
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <Link href={card.href} className="btn accent">
                {card.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
