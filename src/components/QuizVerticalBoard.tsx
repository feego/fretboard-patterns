"use client";

import { type CSSProperties, useEffect, useRef } from "react";
import { type NoteQuiz, positionKey } from "../hooks/useNoteQuiz";
import { NOTES } from "../lib/notes";
import * as styles from "./QuizVerticalBoard.css";

const SINGLE_INLAY_FRETS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_INLAY_FRETS = new Set([12, 24]);

// Low string on the left, like a chord chart (string index 5 = low E).
const STRING_ORDER = [5, 4, 3, 2, 1, 0];

/** Inlay x-position as a fraction across the six string columns. */
function inlayLeft(fraction: number): string {
  return `calc(var(--v-num-col) + (100% - var(--v-num-col)) * ${fraction})`;
}

interface QuizVerticalBoardProps {
  quiz: NoteQuiz;
  /** Open-string names, index 0 = high string. */
  stringNames: string[];
}

/**
 * Portrait-phone fretboard for the note quiz: strings are columns, frets are
 * rows, and only the quiz's fret range is drawn.
 */
export default function QuizVerticalBoard({
  quiz,
  stringNames,
}: QuizVerticalBoardProps) {
  const { settings, stats, question } = quiz;
  const scrollerRef = useRef<HTMLDivElement>(null);

  const frets: number[] = [];
  for (let f = settings.minFret; f <= settings.maxFret; f++) frets.push(f);

  const targetIndexByKey = new Map<string, number>();
  question?.targets.forEach((t, i) => {
    targetIndexByKey.set(positionKey(t.string, t.fret), i);
  });

  // Keep the position being asked about in view when the range scrolls.
  const active =
    question && !question.done ? question.targets[question.activeIndex] : null;
  const activeKey = active ? positionKey(active.string, active.fret) : null;
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !activeKey) return;
    const cellEl = scroller.querySelector(
      `[data-quiz-cell="${activeKey}"]`,
    ) as HTMLElement | null;
    if (!cellEl) return;
    const view = scroller.getBoundingClientRect();
    const rect = cellEl.getBoundingClientRect();
    if (rect.top >= view.top && rect.bottom <= view.bottom) return;
    scroller.scrollBy({
      top: rect.top + rect.height / 2 - (view.top + view.height / 2),
      behavior: "smooth",
    });
  }, [activeKey]);

  const displayStringNames = stringNames.map((name, i) =>
    i === 0 && name === stringNames[stringNames.length - 1]
      ? name.toLowerCase()
      : name,
  );

  return (
    <div
      className={styles.board}
      style={{ "--v-fret-count": frets.length } as CSSProperties}
    >
      <div className={styles.headerRow}>
        <span />
        {STRING_ORDER.map((s) => (
          <span key={s}>{displayStringNames[s]}</span>
        ))}
      </div>

      <div className={styles.scroller} ref={scrollerRef}>
        {frets.map((fret, rowIndex) => (
          <div
            key={fret}
            className={`${styles.row}${rowIndex === 0 ? ` ${fret === 1 ? styles.firstRowNut : styles.firstRowNoNut}` : ""}`}
          >
            <span className={styles.fretNumber}>{fret}</span>
            {STRING_ORDER.map((s) => {
              const key = positionKey(s, fret);
              const enabled = settings.strings[s];
              const stat = stats[key];
              const heat =
                settings.showHeatmap && stat && stat.attempts > 0
                  ? Math.round((stat.correct / stat.attempts) * 100)
                  : null;
              const targetIndex = targetIndexByKey.get(key);
              const target =
                targetIndex != null
                  ? question?.targets[targetIndex]
                  : undefined;

              let markerClass = styles.marker;
              if (target?.answeredPc != null) {
                markerClass += ` ${target.answeredPc === target.pc ? styles.markerCorrect : styles.markerWrong}`;
              } else if (targetIndex === question?.activeIndex) {
                markerClass += ` ${styles.markerActive}`;
              }
              const isGroup = (question?.targets.length ?? 0) > 1;

              return (
                <div
                  key={s}
                  className={styles.cell}
                  data-quiz-cell={key}
                  style={{
                    ...(enabled ? null : { opacity: 0.35 }),
                    ...(heat != null
                      ? {
                          backgroundColor: `color-mix(in srgb, color-mix(in srgb, #16a34a ${heat}%, #dc2626) 40%, var(--color-fretboard))`,
                        }
                      : null),
                  }}
                >
                  {target && targetIndex != null && (
                    <span className={markerClass}>
                      {target.answeredPc != null
                        ? NOTES[target.pc]
                        : isGroup
                          ? targetIndex + 1
                          : "?"}
                    </span>
                  )}
                </div>
              );
            })}
            {SINGLE_INLAY_FRETS.has(fret) && (
              <span className={styles.inlay} style={{ left: inlayLeft(0.5) }} />
            )}
            {DOUBLE_INLAY_FRETS.has(fret) && (
              <>
                <span
                  className={styles.inlay}
                  style={{ left: inlayLeft(1 / 3) }}
                />
                <span
                  className={styles.inlay}
                  style={{ left: inlayLeft(2 / 3) }}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
