"use client";

import { useEffect, useState } from "react";
import * as styles from "./FretboardControls.css";

type ChordValidationResult = { valid: true } | { valid: false; error: string };

function normalizeChordInput(input: string): string {
  // Users often type spaces around slash chords (e.g. "C / E").
  return input.trim().replace(/\s+/g, "");
}

function isNoteToken(token: string): boolean {
  return /^[A-G](?:#|b)?$/.test(token);
}

function validateChordSymbol(raw: string): ChordValidationResult {
  const chord = normalizeChordInput(raw);
  if (!chord) return { valid: true };

  // Common "no chord" markers.
  if (/^(?:N\.?C\.?|NC)$/i.test(chord)) return { valid: true };
  if (chord === "-" || chord === "—") return { valid: true };

  // Only allow a limited, musician-friendly character set.
  // (Still parsed below; this is just an early reject for typos.)
  if (!/^[A-Za-z0-9#b()\-+°øΔ.,\/]+$/.test(chord)) {
    return { valid: false, error: "Invalid characters" };
  }

  const parts = chord.split("/");
  if (parts.length > 2) return { valid: false, error: "Too many '/'" };

  const base = parts[0];
  const bass = parts[1];

  const baseMatch = /^([A-G](?:#|b)?)(.*)$/.exec(base);
  if (!baseMatch) return { valid: false, error: "Chord must start with A–G" };

  const [, root, rawSuffix] = baseMatch;
  if (!isNoteToken(root)) return { valid: false, error: "Invalid root note" };
  if (bass != null && bass.length > 0 && !isNoteToken(bass)) {
    return { valid: false, error: "Invalid slash bass note" };
  }

  const suffix = rawSuffix;
  if (!suffix) return { valid: true };

  // More complete parser for common chord spellings.
  // Supports qualities: maj, min, m, dim, aug, sus(2/4), °, ø, Δ
  // Supports extensions: 2,4,5,6,7,9,11,13,69
  // Supports alterations: b/# + (3,5,9,11,13) e.g. b5, #11
  // Supports add/omit/no: add9, omit3, no5
  // Supports optional parenthetical tensions: C7(b9,#11)
  const s = suffix;
  const lower = s.toLowerCase();

  const isBalancedParens = (text: string) => {
    let depth = 0;
    for (const ch of text) {
      if (ch === "(") depth++;
      else if (ch === ")") {
        depth--;
        if (depth < 0) return false;
      }
    }
    return depth === 0;
  };

  if (!isBalancedParens(s)) {
    return { valid: false, error: "Unbalanced parentheses" };
  }

  const allowedNumbers = new Set(["2", "4", "5", "6", "7", "9", "11", "13", "69"]);
  const allowedAlterNumbers = new Set(["3", "5", "9", "11", "13"]);

  const parseNumberAt = (text: string, i: number) => {
    // Prefer 2-digit degrees when possible.
    const two = text.slice(i, i + 2);
    if (two === "11" || two === "13" || two === "69") return { num: two, next: i + 2 };
    const one = text.slice(i, i + 1);
    if (/^[0-9]$/.test(one)) return { num: one, next: i + 1 };
    return null;
  };

  const parseAlterationAt = (text: string, i: number) => {
    const acc = text[i];
    if (acc !== "b" && acc !== "#") return null;
    const parsed = parseNumberAt(text, i + 1);
    if (!parsed) return null;
    if (!allowedAlterNumbers.has(parsed.num)) return null;
    return { next: parsed.next };
  };

  const parseKeywordAt = (textLower: string, i: number, keyword: string) =>
    textLower.startsWith(keyword, i) ? i + keyword.length : null;

  const parseParenGroupAt = (text: string, i: number) => {
    if (text[i] !== "(") return null;
    const close = text.indexOf(")", i + 1);
    if (close < 0) return null;
    const inner = text.slice(i + 1, close);
    if (inner.trim().length === 0) return null;

    // Allow comma-separated alterations like b9,#11 or add9.
    const pieces = inner.split(",").map((p) => p.trim());
    for (const piece of pieces) {
      if (!piece) return null;

      const pieceLower = piece.toLowerCase();
      let j = 0;

      const addAt = parseKeywordAt(pieceLower, j, "add");
      if (addAt != null) {
        j = addAt;
        const parsed = parseNumberAt(piece, j);
        if (!parsed || !allowedNumbers.has(parsed.num)) return null;
        j = parsed.next;
        if (j !== piece.length) return null;
        continue;
      }

      const altParsed = parseAlterationAt(pieceLower, j);
      if (altParsed) {
        j = altParsed.next;
        if (j !== piece.length) return null;
        continue;
      }

      // A bare degree inside parens (e.g. (9))
      const deg = parseNumberAt(piece, j);
      if (deg && allowedNumbers.has(deg.num) && deg.next === piece.length) {
        continue;
      }

      return null;
    }

    return { next: close + 1 };
  };

  let i = 0;

  // Quality tokens (optional)
  const tryQuality = () => {
    // Order matters.
    const qMaj = parseKeywordAt(lower, i, "maj");
    if (qMaj != null) return (i = qMaj);

    const qMin = parseKeywordAt(lower, i, "min");
    if (qMin != null) return (i = qMin);

    const qDim = parseKeywordAt(lower, i, "dim");
    if (qDim != null) return (i = qDim);

    const qAug = parseKeywordAt(lower, i, "aug");
    if (qAug != null) return (i = qAug);

    const qSus2 = parseKeywordAt(lower, i, "sus2");
    if (qSus2 != null) return (i = qSus2);

    const qSus4 = parseKeywordAt(lower, i, "sus4");
    if (qSus4 != null) return (i = qSus4);

    const qSus = parseKeywordAt(lower, i, "sus");
    if (qSus != null) return (i = qSus);

    // Single-char qualities.
    const ch = s[i];
    if (ch === "Δ") return (i += 1);
    if (ch === "°" || ch === "ø") return (i += 1);

    // "m" as shorthand minor (but not if it's start of maj/min)
    if (lower[i] === "m") return (i += 1);

    // '-' as minor shorthand (common in some charts)
    if (s[i] === "-") return (i += 1);

    // '+' as augmented shorthand
    if (s[i] === "+") return (i += 1);
  };

  tryQuality();

  while (i < s.length) {
    // Parenthetical tensions like (b9,#11)
    const paren = parseParenGroupAt(s, i);
    if (paren) {
      i = paren.next;
      continue;
    }

    // Keywords: add9 / omit3 / no5 / alt
    const addNext = parseKeywordAt(lower, i, "add");
    if (addNext != null) {
      i = addNext;
      const parsed = parseNumberAt(s, i);
      if (!parsed || !allowedNumbers.has(parsed.num)) {
        return { valid: false, error: "Invalid add degree" };
      }
      i = parsed.next;
      continue;
    }

    const omitNext = parseKeywordAt(lower, i, "omit");
    if (omitNext != null) {
      i = omitNext;
      const parsed = parseNumberAt(s, i);
      if (!parsed || (parsed.num !== "3" && parsed.num !== "5")) {
        return { valid: false, error: "omit must be 3 or 5" };
      }
      i = parsed.next;
      continue;
    }

    const noNext = parseKeywordAt(lower, i, "no");
    if (noNext != null) {
      i = noNext;
      const parsed = parseNumberAt(s, i);
      if (!parsed || (parsed.num !== "3" && parsed.num !== "5")) {
        return { valid: false, error: "no must be 3 or 5" };
      }
      i = parsed.next;
      continue;
    }

    const altNext = parseKeywordAt(lower, i, "alt");
    if (altNext != null) {
      i = altNext;
      continue;
    }

    // Alterations: b5, #11, etc.
    const alt = parseAlterationAt(lower, i);
    if (alt) {
      i = alt.next;
      continue;
    }

    // Plain degrees/extensions: 7, 9, 11, 13, 69
    const deg = parseNumberAt(s, i);
    if (deg) {
      if (!allowedNumbers.has(deg.num)) {
        return { valid: false, error: `Unsupported degree ${deg.num}` };
      }
      i = deg.next;
      continue;
    }

    // If we get here, we couldn't parse the next token.
    return { valid: false, error: "Unrecognized chord modifier" };
  }

  return { valid: true };
}

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
  showCagedNotes: boolean;
  onToggleCagedNotes: () => void;
  metronomeState: "stopped" | "running" | "paused";
  metronomeBeat: number | null;
  bpm: number;
  onPlayPauseMetronome: () => void;
  onStopMetronome: () => void;
  onBpmChange: (bpm: number) => void;
  onActiveBeatKeyChange?: (keyText: string) => void;
  onActiveBeatChordChange?: (chordText: string) => void;
}

export default function FretboardControls({
  showDimmedNotes,
  onToggleDimmedNotes,
  showDegrees,
  onToggleDegrees,
  showCagedNotes,
  onToggleCagedNotes,
  metronomeState,
  metronomeBeat,
  bpm,
  onPlayPauseMetronome,
  onStopMetronome,
  onBpmChange,
  onActiveBeatKeyChange,
  onActiveBeatChordChange,
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

  const totalBeats = bars.length * 4;
  const metronomeActive = metronomeState !== "stopped";
  const activeFlatBeat =
    metronomeActive && metronomeBeat != null && totalBeats > 0
      ? ((metronomeBeat % totalBeats) + totalBeats) % totalBeats
      : null;
  const activeBarIndex =
    activeFlatBeat != null ? Math.floor(activeFlatBeat / 4) : null;
  const activeBeatIndex = activeFlatBeat != null ? activeFlatBeat % 4 : null;

  useEffect(() => {
    if (!onActiveBeatKeyChange) return;

    if (!metronomeActive || activeBarIndex == null || activeBeatIndex == null) {
      onActiveBeatKeyChange("");
      return;
    }

    onActiveBeatKeyChange(beatKeys[activeBarIndex]?.[activeBeatIndex] ?? "");
  }, [
    onActiveBeatKeyChange,
    metronomeActive,
    activeBarIndex,
    activeBeatIndex,
    beatKeys,
  ]);

  useEffect(() => {
    if (!onActiveBeatChordChange) return;

    if (!metronomeActive || activeBarIndex == null || activeBeatIndex == null) {
      onActiveBeatChordChange("");
      return;
    }

    onActiveBeatChordChange(bars[activeBarIndex]?.[activeBeatIndex] ?? "");
  }, [
    onActiveBeatChordChange,
    metronomeActive,
    activeBarIndex,
    activeBeatIndex,
    bars,
  ]);

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
            onClick={onPlayPauseMetronome}
            aria-label={
              metronomeState === "running"
                ? "Pause metronome"
                : metronomeState === "paused"
                  ? "Resume metronome"
                  : "Start metronome"
            }
            title={
              metronomeState === "running"
                ? "Pause"
                : metronomeState === "paused"
                  ? "Resume"
                  : "Start"
            }
          >
            {metronomeState === "running" ? "⏸" : "▶"}
          </button>

          <button
            type="button"
            className={styles.metronomeButton}
            onClick={onStopMetronome}
            disabled={metronomeState === "stopped"}
            aria-label="Stop metronome"
            title="Stop"
          >
            ■
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

      <div className={styles.section} data-chords-editor="true">
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
            const isActiveBar = metronomeActive && activeBarIndex === barIndex;
            const canRemove = bars.length > 1;

            return (
              <div
                key={`bar-${barIndex}`}
                className={
                  `${styles.barCell} ` +
                  `${isLastBar ? styles.barCellLast : ""} ` +
                  `${isActiveBar ? styles.barCellActive : ""} ` +
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
                  {barBeats.map((beatChord, beatIndex) => {
                    const validation = validateChordSymbol(beatChord);
                    const isInvalid = !validation.valid;
                    const error = isInvalid ? validation.error : undefined;
                    const errorId = isInvalid
                      ? `chord-error-${barIndex}-${beatIndex}`
                      : undefined;

                    return (
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
                        } ${isInvalid ? styles.beatCellError : ""}`}
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
                          className={`${styles.beatChordInput} ${
                            isInvalid ? styles.beatChordInputInvalid : ""
                          }`}
                          type="text"
                          value={beatChord}
                          placeholder={
                            barIndex === 0 && beatIndex === 0 ? "Cmaj7" : ""
                          }
                          aria-invalid={isInvalid}
                          aria-describedby={errorId}
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

                        {isInvalid && error ? (
                          <div
                            id={errorId}
                            className={styles.chordErrorTooltip}
                            role="tooltip"
                          >
                            {error}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.row}>
        <label className={styles.toggleLabel}>
          <input
            className={styles.toggleCheckbox}
            type="checkbox"
            checked={showDimmedNotes}
            onChange={onToggleDimmedNotes}
          />
          <span className={styles.toggleText}>Show Dimmed Notes</span>
        </label>

        <label className={styles.toggleLabel}>
          <input
            className={styles.toggleCheckbox}
            type="checkbox"
            checked={showDegrees}
            onChange={onToggleDegrees}
          />
          <span className={styles.toggleText}>Show Scale Degrees</span>
        </label>

        <label className={styles.toggleLabel}>
          <input
            className={styles.toggleCheckbox}
            type="checkbox"
            checked={showCagedNotes}
            onChange={onToggleCagedNotes}
          />
          <span className={styles.toggleText}>Show CAGED Notes</span>
        </label>
      </div>
    </div>
  );
}
