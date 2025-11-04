"use client";

import * as styles from "./FretboardControls.css";

interface FretboardControlsProps {
  showDimmedNotes: boolean;
  onToggleDimmedNotes: () => void;
  tuning: string;
  onTuningChange: (tuning: string) => void;
}

export default function FretboardControls({
  showDimmedNotes,
  onToggleDimmedNotes,
  tuning,
  onTuningChange,
}: FretboardControlsProps) {
  const tuningOptions = [
    { value: "standard", label: "Standard (E-A-D-G-B-E)" },
    { value: "allFourths", label: "All Fourths (E-A-D-G-C-F)" },
  ];

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={onToggleDimmedNotes}>
        {showDimmedNotes ? "Hide" : "Show"} Dimmed Notes
      </button>
      
      <div className={styles.selectWrapper}>
        <label className={styles.label} htmlFor="tuning-select">
          Tuning:
        </label>
        <select
          id="tuning-select"
          className={styles.select}
          value={tuning}
          onChange={(e) => onTuningChange(e.target.value)}
        >
          {tuningOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
