"use client";

import { useEffect, useState } from "react";
import * as styles from "./FretboardControls.css";

function getBeatFitCh(chordText: string): number {
  // Tune so the grid feels iReal-like but still expands for longer symbols.
  // Using ch units keeps it font-relative and cheap to compute.
  const len = chordText.trim().length;

  // Keep empty/short chords compact.
  if (len <= 1) return 6;
  return Math.min(24, Math.max(6, len + 2));
}

function getBeatWeight(chordText: string): number {
  // Heavier weighting than fit-content so you can *see* the column grow.
  const len = chordText.trim().length;
  if (len === 0) return 1;
  return Math.min(12, len + 2);
}

interface FretboardControlsProps {
  showDimmedNotes: boolean;
  onToggleDimmedNotes: () => void;
  showDegrees: boolean;
  onToggleDegrees: () => void;
  onSelectCagedNotes: () => void;
  onClearSelectedNotes: () => void;
  metronomeOn: boolean;
  bpm: number;
  onToggleMetronome: () => void;
  onBpmChange: (bpm: number) => void;
}

export default function FretboardControls({
  showDimmedNotes,
  onToggleDimmedNotes,
  showDegrees,
  onToggleDegrees,
  onSelectCagedNotes,
  onClearSelectedNotes,
  metronomeOn,
  bpm,
  onToggleMetronome,
  onBpmChange,
}: FretboardControlsProps) {
  const [isDesktopGrid, setIsDesktopGrid] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const onChange = () => setIsDesktopGrid(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const [bars, setBars] = useState<string[][]>(() =>
    Array.from({ length: 12 }, () => ["", "", "", ""]),
  );
  const [beatKeys, setBeatKeys] = useState<string[][]>(() =>
    Array.from({ length: 12 }, () => ["", "", "", ""]),
  );

  const insertBarRightOf = (barIndex: number) => {
    const insertAt = Math.min(barIndex + 1, bars.length);

    setBars((prev) => {
      const copy = [...prev];
      copy.splice(insertAt, 0, ["", "", "", ""]);
      return copy;
    });

    setBeatKeys((prev) => {
      const copy = [...prev];
      copy.splice(insertAt, 0, ["", "", "", ""]);
      return copy;
    });
  };

  const removeBarAt = (barIndex: number) => {
    if (bars.length <= 1) return;

    setBars((prev) => {
      const copy = [...prev];
      copy.splice(barIndex, 1);
      return copy;
    });

    setBeatKeys((prev) => {
      const copy = [...prev];
      copy.splice(barIndex, 1);
      return copy;
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.chordsTopRightRow}>
        <div className={styles.metronomeControls}>
          <button
            type="button"
            className={styles.metronomeButton}
            onClick={onToggleMetronome}
          >
            {metronomeOn ? "Stop" : "Start"}
          </button>

          <label className={styles.metronomeLabel} htmlFor="chords-bpm">
            BPM
          </label>
          <input
            id="chords-bpm"
            className={styles.metronomeInput}
            type="number"
            min={30}
            max={300}
            step={1}
            value={bpm}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (!Number.isFinite(next)) return;
              onBpmChange(next);
            }}
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.barsGrid}>
          {bars.map((barBeats, barIndex) => {
            const columns = isDesktopGrid ? 4 : 1;
            const firstRowLastIndex = Math.min(columns, bars.length) - 1;
            const totalRows = Math.ceil(bars.length / columns);
            const lastRowStartIndex = Math.max(0, (totalRows - 1) * columns);
            const isLastRowFull = bars.length % columns === 0;
            const shouldRoundLastRowRight = totalRows === 1 || isLastRowFull;

            const isTopLeft = barIndex === 0;
            const isTopRight = barIndex === firstRowLastIndex;
            const isBottomLeft = barIndex === lastRowStartIndex;
            const isBottomRight =
              shouldRoundLastRowRight && barIndex === bars.length - 1;

            const gridTemplateColumns = barBeats
              .map(
                (beatChord) => `minmax(4.25rem, ${getBeatWeight(beatChord)}fr)`,
              )
              .join(" ");

            const isLastBar = barIndex === bars.length - 1;
            const canRemove = bars.length > 1;

            return (
              <div
                key={`bar-${barIndex}`}
                className={
                  `${styles.barCell} ` +
                  `${isLastBar ? styles.barCellLast : ""} ` +
                  `${isTopLeft ? styles.barCellTopLeft : ""} ` +
                  `${isTopRight ? styles.barCellTopRight : ""} ` +
                  `${isBottomLeft ? styles.barCellBottomLeft : ""} ` +
                  `${isBottomRight ? styles.barCellBottomRight : ""}`
                }
              >
                <div className={styles.barMenu}>
                  <button
                    type="button"
                    className={`${styles.barMenuButton} ${styles.barMenuButtonDanger}`}
                    onClick={() => removeBarAt(barIndex)}
                    disabled={!canRemove}
                    aria-disabled={!canRemove}
                    aria-label="Remove bar"
                  >
                    –
                  </button>
                  <button
                    type="button"
                    className={styles.barMenuButton}
                    onClick={() => insertBarRightOf(barIndex)}
                    aria-label="Add bar"
                  >
                    +
                  </button>
                </div>

                <div
                  className={styles.barBeatGrid}
                  style={{ gridTemplateColumns }}
                >
                  {barBeats.map((beatChord, beatIndex) => (
                    <div
                      key={`bar-${barIndex}-beat-${beatIndex}`}
                      className={`${styles.beatCell} ${
                        beatIndex === 0
                          ? styles.beatCell0
                          : beatIndex === 1
                            ? styles.beatCell1
                            : beatIndex === 2
                              ? styles.beatCell2
                              : styles.beatCell3
                      }`}
                    >
                      <input
                        aria-label={`Bar ${barIndex + 1} Beat ${beatIndex + 1} Key`}
                        className={styles.beatKeyInput}
                        type="text"
                        value={beatKeys[barIndex]?.[beatIndex] ?? ""}
                        placeholder={
                          barIndex === 0 && beatIndex === 0 ? "C" : ""
                        }
                        onChange={(e) => {
                          const nextKey = e.target.value;
                          setBeatKeys((prev) => {
                            const copy = [...prev];
                            const barCopy = [
                              ...(copy[barIndex] ?? ["", "", "", ""]),
                            ];
                            barCopy[beatIndex] = nextKey;
                            copy[barIndex] = barCopy;
                            return copy;
                          });
                        }}
                      />
                      <input
                        aria-label={`Bar ${barIndex + 1} Beat ${beatIndex + 1}`}
                        className={styles.beatChordInput}
                        type="text"
                        value={beatChord}
                        placeholder={
                          barIndex === 0 && beatIndex === 0 ? "Cmaj7" : ""
                        }
                        onChange={(e) => {
                          const nextChord = e.target.value;
                          setBars((prev) => {
                            const copy = [...prev];
                            const barCopy = [...copy[barIndex]];
                            barCopy[beatIndex] = nextChord;
                            copy[barIndex] = barCopy;
                            return copy;
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
