"use client";

import styles from "./BackgroundFX.module.css";

export function BackgroundFX() {
  return (
    <div className={styles.root} aria-hidden>
      <div className={styles.aurora} />
      <div className={styles.grid} />
    </div>
  );
}
