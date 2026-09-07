"use client";

import { TEMPLATES, VERTICAL_LABELS } from "@vitacircle/shared";
import { landingCopy } from "./landingCopy";
import styles from "./landing.module.css";

export function TemplatesShowcase() {
  const c = landingCopy.templates;

  return (
    <section id="templates" className={`${styles.section} container`}>
      <div className={styles.sectionHeader} data-aos="fade-up">
        <p className={styles.eyebrow}>{c.eyebrow}</p>
        <h2 className={styles.sectionTitle}>{c.title}</h2>
        <p className={styles.sectionBody}>{c.body}</p>
      </div>
      <div className={styles.templatesScroll}>
        {TEMPLATES.map((t, i) => (
          <article
            key={t.id}
            className={styles.templateCard}
            data-aos="fade-up"
            data-aos-delay={i * 40}
          >
            <div className={styles.templateSwatch} style={{ background: t.theme.colorAccent }} />
            <div className={styles.templateInfo}>
              <h3 className={styles.templateName}>{t.name}</h3>
              <p className={styles.templateMeta}>
                {VERTICAL_LABELS[t.vertical]} · {t.free ? "Free" : "Pro"}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
