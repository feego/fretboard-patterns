"use client";

import { useEffect, useState } from "react";
import {
  FLAT_NAMES,
  NOTES,
  pitchClassLabel as noteName,
  toPitchClass,
} from "../lib/notes";
import {
  type NoteQuiz,
  positionKey,
  QUIZ_MAX_FRET,
  QUIZ_MIN_FRET,
} from "../hooks/useNoteQuiz";
import * as styles from "./NoteQuizPanel.css";

interface NoteQuizPanelProps {
  quiz: NoteQuiz;
  /** Open-string names, index 0 = high string. */
  stringNames: string[];
  /** Phone layout: one-line header, settings behind a toggle, no keyboard hint. */
  compact?: boolean;
  onExit?: () => void;
}

export default function NoteQuizPanel({
  quiz,
  stringNames,
  compact = false,
  onExit,
}: NoteQuizPanelProps) {
  const { settings, setSettings, question, score, stats, submit, skip } = quiz;
  const [pendingLetter, setPendingLetter] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const showSettings = !compact || settingsOpen;

  // Keyboard: letter (A–G), then # or b to answer an accidental, or Enter for a natural.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key;
      if (key === "Escape") {
        setPendingLetter(null);
        return;
      }
      if (question?.done) {
        if (key === "Enter" || key === " ") {
          e.preventDefault();
          skip();
        }
        return;
      }

      const isFlatKey = key === "b" || key === "-";
      const isSharpKey =
        key === "#" || key === "+" || (e.shiftKey && e.code === "Digit3");
      if (pendingLetter && (isFlatKey || isSharpKey)) {
        e.preventDefault();
        const pc = toPitchClass(`${pendingLetter}${isSharpKey ? "#" : "b"}`);
        setPendingLetter(null);
        if (pc != null) submit(pc);
        return;
      }
      if (/^[a-gA-G]$/.test(key)) {
        e.preventDefault();
        setPendingLetter(key.toUpperCase());
        return;
      }
      if (pendingLetter && (key === "Enter" || key === " ")) {
        e.preventDefault();
        const pc = toPitchClass(pendingLetter);
        setPendingLetter(null);
        if (pc != null) submit(pc);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pendingLetter, question?.done, skip, submit]);

  const lastAnswered =
    question && question.activeIndex > 0
      ? question.targets[question.activeIndex - 1]
      : null;
  const pendingPc = pendingLetter ? toPitchClass(pendingLetter) : null;

  // Empty only for the first render, before the first question is picked.
  let promptText = "";
  let promptClass = "";
  if (question && !question.done) {
    const isGroup = question.targets.length > 1;
    const position = `${question.activeIndex + 1} of ${question.targets.length}`;
    if (compact) {
      promptText = isGroup ? `Note ${position}` : "Name the note";
    } else {
      promptText = isGroup
        ? `Name note ${position}`
        : "Name the highlighted note";
    }
  } else if (question?.done) {
    const correctCount = question.targets.filter(
      (t) => t.answeredPc === t.pc,
    ).length;
    const allCorrect = correctCount === question.targets.length;
    promptClass = allCorrect ? styles.promptCorrect : styles.promptWrong;
    if (question.targets.length > 1) {
      promptText = `${correctCount}/${question.targets.length} correct`;
    } else {
      const t = question.targets[0];
      promptText = allCorrect
        ? `✓ ${noteName(t.pc)}`
        : compact
          ? `✗ It was ${noteName(t.pc)}`
          : `✗ It was ${noteName(t.pc)}, you said ${noteName(t.answeredPc ?? 0)}`;
    }
  }

  // Lifetime coverage of the current range, from the saved per-position stats.
  let practiced = 0;
  let poolSize = 0;
  let lifetimeAttempts = 0;
  let lifetimeCorrect = 0;
  for (let s = 0; s < settings.strings.length; s++) {
    if (!settings.strings[s]) continue;
    for (let f = settings.minFret; f <= settings.maxFret; f++) {
      poolSize++;
      const stat = stats[positionKey(s, f)];
      if (!stat) continue;
      practiced++;
      lifetimeAttempts += stat.attempts;
      lifetimeCorrect += stat.correct;
    }
  }

  const displayStringNames = stringNames.map((name, i) =>
    i === 0 && name === stringNames[stringNames.length - 1]
      ? name.toLowerCase()
      : name,
  );

  return (
    <section
      className={`${styles.panel}${compact ? ` ${styles.panelCompact}` : ""}`}
      aria-label="Note quiz"
    >
      {compact && (
        <div className={styles.compactTopRow}>
          <div
            className={`${styles.prompt} ${styles.compactPrompt} ${promptClass}`}
            aria-live="polite"
          >
            {promptText}
          </div>
          <span className={styles.compactScore}>
            {score.correct}/{score.total}
            {score.streak > 1 ? ` · ${score.streak} in a row` : ""}
          </span>
          <button
            type="button"
            className={`${styles.segmentButton} ${styles.compactButton}${settingsOpen ? ` ${styles.segmentButtonActive}` : ""}`}
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen((v) => !v)}
          >
            Options
          </button>
          {onExit && (
            <button
              type="button"
              className={`${styles.segmentButton} ${styles.compactButton}`}
              onClick={onExit}
            >
              Exit
            </button>
          )}
        </div>
      )}

      {showSettings && (
        <div className={styles.settingsBar}>
          <fieldset className={styles.segment} aria-label="Question type">
            {(["single", "group"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className={`${styles.segmentButton}${settings.mode === mode ? ` ${styles.segmentButtonActive}` : ""}`}
                aria-pressed={settings.mode === mode}
                onClick={() => setSettings({ mode })}
              >
                {mode === "single" ? "Single" : "Group"}
              </button>
            ))}
          </fieldset>

          {settings.mode === "group" && (
            <label className={styles.group}>
              Notes
              <input
                className={styles.fretInput}
                type="number"
                min={2}
                max={5}
                value={settings.groupSize}
                onChange={(e) =>
                  setSettings({ groupSize: Number(e.target.value) })
                }
              />
            </label>
          )}

          <div className={styles.group}>
            <label className={styles.group}>
              Frets
              <input
                className={styles.fretInput}
                type="number"
                min={QUIZ_MIN_FRET}
                max={QUIZ_MAX_FRET}
                value={settings.minFret}
                aria-label="Lowest fret"
                onChange={(e) => {
                  const minFret = Number(e.target.value);
                  if (!Number.isFinite(minFret)) return;
                  setSettings({
                    minFret,
                    maxFret: Math.max(minFret, settings.maxFret),
                  });
                }}
              />
            </label>
            –
            <input
              className={styles.fretInput}
              type="number"
              min={QUIZ_MIN_FRET}
              max={QUIZ_MAX_FRET}
              value={settings.maxFret}
              aria-label="Highest fret"
              onChange={(e) => {
                const maxFret = Number(e.target.value);
                if (!Number.isFinite(maxFret)) return;
                setSettings({
                  maxFret,
                  minFret: Math.min(maxFret, settings.minFret),
                });
              }}
            />
          </div>

          <div className={styles.group}>
            Strings
            <fieldset className={styles.segment} aria-label="Strings">
              {displayStringNames.map((name, i) => {
                const on = settings.strings[i];
                const isLastOn =
                  on && settings.strings.filter(Boolean).length === 1;
                return (
                  <button
                    // biome-ignore lint/suspicious/noArrayIndexKey: strings are a fixed set of six
                    key={i}
                    type="button"
                    className={`${styles.segmentButton}${on ? ` ${styles.segmentButtonActive}` : ""}`}
                    aria-pressed={on}
                    aria-label={`String ${i + 1} (${name})`}
                    disabled={isLastOn}
                    onClick={() =>
                      setSettings({
                        strings: settings.strings.map((v, j) =>
                          j === i ? !v : v,
                        ),
                      })
                    }
                  >
                    {name}
                  </button>
                );
              })}
            </fieldset>
          </div>

          <label className={styles.group}>
            <input
              type="checkbox"
              checked={settings.showHeatmap}
              onChange={(e) => setSettings({ showHeatmap: e.target.checked })}
            />
            Heatmap
          </label>
        </div>
      )}

      {!compact && (
        <div className={`${styles.prompt} ${promptClass}`} aria-live="polite">
          {promptText}
        </div>
      )}

      <div className={styles.answerGrid}>
        {NOTES.map((sharp, pc) => {
          const flat = FLAT_NAMES[sharp];
          let stateClass = "";
          if (pc === pendingPc && !question?.done) {
            stateClass = styles.answerButtonPending;
          } else if (lastAnswered?.pc === pc) {
            stateClass = styles.answerButtonCorrect;
          } else if (lastAnswered?.answeredPc === pc) {
            stateClass = styles.answerButtonWrong;
          }
          return (
            <button
              key={sharp}
              type="button"
              className={`${styles.answerButton} ${stateClass}`}
              disabled={!question || question.done}
              onClick={() => {
                setPendingLetter(null);
                submit(pc);
              }}
            >
              <span>{sharp}</span>
              {flat && <span className={styles.answerButtonAlt}>{flat}</span>}
            </button>
          );
        })}
      </div>

      {showSettings && (
        <div className={styles.scoreRow}>
          <span>
            Score{" "}
            <span className={styles.scoreValue}>
              {score.correct}/{score.total}
            </span>
          </span>
          <span>
            Streak <span className={styles.scoreValue}>{score.streak}</span>
          </span>
          <span>
            Best <span className={styles.scoreValue}>{score.bestStreak}</span>
          </span>
          <span>
            Avg{" "}
            <span className={styles.scoreValue}>
              {score.total > 0
                ? `${(score.totalMs / score.total / 1000).toFixed(1)}s`
                : "–"}
            </span>
          </span>
          <span>
            Practiced{" "}
            <span className={styles.scoreValue}>
              {practiced}/{poolSize}
            </span>
            {lifetimeAttempts > 0 &&
              ` (${Math.round((lifetimeCorrect / lifetimeAttempts) * 100)}% all-time)`}
          </span>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => {
              if (
                window.confirm("Forget all saved quiz stats for this tuning?")
              ) {
                quiz.resetStats();
              }
            }}
          >
            Reset stats
          </button>
        </div>
      )}

      {!compact && (
        <div className={styles.hint}>
          Keys: A–G, then # or b for sharps and flats, or Enter for a natural.
          {question?.done ? " Enter skips to the next question." : ""}
        </div>
      )}
    </section>
  );
}
