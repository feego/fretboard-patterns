"use client";

import * as styles from "./FretboardArrows.css";

export type ArrowKey = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";

export default function FretboardArrows({
  onNavigate,
}: {
  onNavigate: (key: ArrowKey) => void;
}) {
  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.button}
        onClick={() => onNavigate("ArrowLeft")}
        aria-label="Move left"
      >
        ←
      </button>
      <button
        type="button"
        className={styles.button}
        onClick={() => onNavigate("ArrowUp")}
        aria-label="Move up"
      >
        ↑
      </button>
      <button
        type="button"
        className={styles.button}
        onClick={() => onNavigate("ArrowDown")}
        aria-label="Move down"
      >
        ↓
      </button>
      <button
        type="button"
        className={styles.button}
        onClick={() => onNavigate("ArrowRight")}
        aria-label="Move right"
      >
        →
      </button>
    </div>
  );
}