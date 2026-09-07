"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { landingCopy } from "./landingCopy";
import { ease } from "./motion";
import styles from "./landing.module.css";

export function FaqSection() {
  const c = landingCopy.faq;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className={`${styles.section} container`}>
      <div className={`${styles.sectionHeader} ${styles.sectionHeaderCenter}`} data-aos="fade-up">
        <p className={styles.eyebrow}>{c.eyebrow}</p>
        <h2 className={styles.sectionTitle}>{c.title}</h2>
      </div>
      <div className={styles.faqList} data-aos="fade-up" data-aos-delay="100">
        {c.items.map((item, i) => (
          <div key={item.q} className={styles.faqItem}>
            <button type="button" className={styles.faqQuestion} onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
              {item.q}
              <motion.span
                animate={{ rotate: open === i ? 45 : 0 }}
                transition={{ duration: 0.25 }}
                style={{ fontSize: 22, color: "var(--accent)", lineHeight: 1 }}
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  className={styles.faqAnswer}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <div className={styles.faqAnswerInner}>{item.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
