import styles from "./landing.module.css";

export function LandingDecor() {
  return (
    <div className={styles.decorLayer} aria-hidden>
      <div className={styles.gridPattern} />
    </div>
  );
}
