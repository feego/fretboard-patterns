"use client";

import * as styles from "./StringLabels.css";

interface StringLabelsProps {
  strings: string[];
  stringKeys?: string[];
}

export default function StringLabels({
  strings,
  stringKeys,
}: StringLabelsProps) {
  return (
    <div className={styles.container}>
      {strings.map((label, index) => (
        <div
          key={stringKeys?.[index] ?? `${label}-${index}`}
          className={styles.label}
        >
          {label}
        </div>
      ))}
    </div>
  );
}
