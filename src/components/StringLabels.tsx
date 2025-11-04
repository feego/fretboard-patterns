"use client";

import * as styles from "./StringLabels.css";

interface StringLabelsProps {
  strings: string[];
}

export default function StringLabels({ strings }: StringLabelsProps) {
  return (
    <div className={styles.container}>
      {strings.map((string, index) => (
        <div key={index} className={styles.label}>
          {string}
        </div>
      ))}
    </div>
  );
}
