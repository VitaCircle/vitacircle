"use client";

import Image from "next/image";
import { motion, type MotionStyle } from "framer-motion";
import { landingCopy } from "./landingCopy";
import { ease, floatLoop, useCountUp, usePrefersReducedMotion } from "./motion";
import styles from "./landing.module.css";

type Props = {
  style?: MotionStyle;
};

export function HeroPortfolioPreview({ style }: Props) {
  const reduced = usePrefersReducedMotion();
  const animatedScore = useCountUp(landingCopy.aiDemo.sampleScore, !reduced);
  const score = reduced ? landingCopy.aiDemo.sampleScore : animatedScore;

  return (
    <motion.div className={styles.heroVisualWrap} style={style}>
      <div className={styles.heroMesh} aria-hidden />

      <motion.div
        className={`${styles.previewFrame} ${styles.glassCard}`}
        animate={reduced ? undefined : floatLoop}
      >
        <motion.div
          className={styles.previewScoreBadge}
          animate={reduced ? undefined : { scale: [1, 1.06, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          AI {score}
        </motion.div>

        <div className={styles.previewChrome}>
          <span className={styles.mockupDot} style={{ background: "#ff5f57" }} />
          <span className={styles.mockupDot} style={{ background: "#febc2e" }} />
          <span className={styles.mockupDot} style={{ background: "#28c840" }} />
          <span className={styles.previewUrl}>username.vitacircle.app</span>
        </div>

        <div className={styles.previewBody}>
          <div className={styles.previewHeroBlock}>
            <Image src="/4291.jpg" alt="" fill sizes="440px" />
            <div className={styles.previewHeroText}>Alex Chen · Product Designer</div>
          </div>
          <div className={styles.previewThumbs}>
            {["/computer-bg1.jpg", "/student-with-books-bg.jpg", "/student-researching-bg.jpg"].map(
              (src) => (
                <div key={src} className={styles.previewThumb}>
                  <Image src={src} alt="" fill sizes="120px" />
                </div>
              ),
            )}
          </div>
          <div className={styles.mockupProject} />
        </div>
      </motion.div>

      <motion.div
        className={`${styles.satelliteCard} ${styles.satellite1}`}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease }}
      >
        <span className={styles.satelliteScoreRing} aria-hidden />
        Role-fit score {landingCopy.aiDemo.sampleScore}
      </motion.div>

      <motion.div
        className={`${styles.satelliteCard} ${styles.satellite2}`}
        initial={{ opacity: 0, y: 16 }}
        animate={reduced ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -6, 0] }}
        transition={
          reduced
            ? { delay: 0.65, duration: 0.5, ease }
            : { delay: 0.65, duration: 3.5, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <span className={styles.satellitePdfIcon} aria-hidden />
        Export ready
      </motion.div>

      <motion.div
        className={`${styles.satelliteCard} ${styles.satellite3}`}
        initial={{ opacity: 0, x: 16 }}
        animate={reduced ? { opacity: 1, x: 0 } : { opacity: 1, x: [0, 4, 0] }}
        transition={
          reduced
            ? { delay: 0.8, duration: 0.5, ease }
            : { delay: 0.8, duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
      >
        username.vitacircle.app
      </motion.div>
    </motion.div>
  );
}
