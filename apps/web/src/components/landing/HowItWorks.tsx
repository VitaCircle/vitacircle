"use client";

import Image from "next/image";
import { landingCopy } from "./landingCopy";
import styles from "./landing.module.css";

export function HowItWorks() {
  const c = landingCopy.howItWorks;

  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className="container">
        <div className={styles.sectionHeader} data-aos="fade-up">
          <p className={styles.eyebrow}>{c.eyebrow}</p>
          <h2 className={styles.sectionTitle}>{c.title}</h2>
        </div>
        <div className={styles.howGrid}>
          <div className={styles.howSteps}>
            {c.steps.map((step, i) => (
              <div
                key={step.step}
                className={styles.howStep}
                data-aos="fade-right"
                data-aos-delay={i * 100}
              >
                <span className={styles.howStepNum}>{step.step}</span>
                <div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 20 }}>{step.title}</h3>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: 15, lineHeight: 1.6 }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.howImageWrap} data-aos="fade-left" data-aos-duration="1000">
            <Image src="/computer-bg1.jpg" alt="Creative workspace" fill sizes="(max-width: 900px) 100vw, 50vw" />
            <div className={styles.howImageOverlay} />
          </div>
        </div>
      </div>
    </section>
  );
}
