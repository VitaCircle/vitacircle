"use client";

import { landingCopy } from "./landingCopy";
import { FEATURE_ICONS } from "./featureIcons";
import styles from "./landing.module.css";

export function FeaturesGrid() {
  const c = landingCopy.features;

  return (
    <section id="features" className={`${styles.section} container`}>
      <div className={styles.sectionHeader} data-aos="fade-up">
        <p className={styles.eyebrow}>{c.eyebrow}</p>
        <h2 className={styles.sectionTitle}>{c.title}</h2>
      </div>
      <div className={styles.featuresGrid}>
        {c.items.map((item, i) => {
          const Icon = FEATURE_ICONS[i];
          return (
            <article
              key={item.title}
              className={styles.featureCard}
              data-aos="fade-up"
              data-aos-delay={i * 60}
            >
              <span className={styles.featureIcon}>
                {Icon ? <Icon size={24} /> : item.icon}
              </span>
              <h3 className={styles.featureTitle}>{item.title}</h3>
              <p className={styles.featureBody}>{item.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
