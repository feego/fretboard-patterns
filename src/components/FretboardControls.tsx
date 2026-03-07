"use client";

import * as styles from "./FretboardControls.css";


interface FretboardControlsProps {
  showDimmedNotes: boolean;
  onToggleDimmedNotes: () => void;
  tuning: string;
  onTuningChange: (tuning: string) => void;
  showDegrees: boolean;
  onToggleDegrees: () => void;
  onSelectCagedNotes: () => void;
  onClearSelectedNotes: () => void;
}

export default function FretboardControls({
  showDimmedNotes,
  onToggleDimmedNotes,
  tuning,
  onTuningChange,
  showDegrees,
  onToggleDegrees,
  onSelectCagedNotes,
  onClearSelectedNotes,
}: FretboardControlsProps) {
  const tuningOptions = [
    { value: "standard", label: "Standard (E-A-D-G-B-E)" },
    { value: "allFourths", label: "All Fourths (E-A-D-G-C-F)" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <button
          type="button"
          className={styles.button}
          onClick={onToggleDimmedNotes}
        >
          {showDimmedNotes ? "Hide" : "Show"} Dimmed Notes
        </button>

        <button
          type="button"
          className={styles.button}
          onClick={onToggleDegrees}
        >
          {showDegrees ? "Show Note Names" : "Show Scale Degrees"}
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

      <div className={styles.row}>
        <button
          type="button"
          className={styles.button}
          onClick={onSelectCagedNotes}
        >
          Select CAGED Notes
        </button>

        <button
          type="button"
          className={styles.button}
          onClick={onClearSelectedNotes}
        >
          Clear Selected Notes
        </button>
      </div>
    </div>
  );
}
