"use client";

import Image from "next/image";
import { landingCopy } from "./landingCopy";
import styles from "./landing.module.css";

export function CareerOsSection() {
  const c = landingCopy.careerOs;

  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className="container">
        <div className={styles.careerGrid}>
          <div data-aos="fade-right">
            <p className={styles.eyebrow}>{c.eyebrow}</p>
            <h2 className={styles.sectionTitle}>{c.title}</h2>
            <p className={styles.sectionBody}>{c.body}</p>
            <div className={styles.pipeline}>
              {c.pipeline.map((step, i) => (
                <div
                  key={step}
                  className={`${styles.pipelineStep} ${i === 1 ? styles.pipelineStepActive : ""}`}
                  data-aos="zoom-in"
                  data-aos-delay={i * 80}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.careerPhoto} data-aos="fade-left" data-aos-duration="1000">
            <Image src="/student-researching-bg.jpg" alt="Student researching opportunities" fill sizes="(max-width: 900px) 100vw, 50vw" />
            <div className={styles.careerPhotoOverlay} />
          </div>
        </div>
      </div>
    </section>
  );
}
