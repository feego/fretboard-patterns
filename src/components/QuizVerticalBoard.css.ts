import { keyframes, style } from "@vanilla-extract/css";
import { borderRadius, colors } from "../styles/theme";
import { stringLineColor } from "../styles/stringLine";

/**
 * Sizing is pure CSS: the board fills the height above the pinned answer pad
 * (--quiz-pad-height, set by the parent), split evenly between the fret rows
 * (--v-fret-count), with a floor so long ranges scroll instead of squashing.
 */
export const board = style({
  vars: {
    "--v-num-col": "1.75rem",
    "--v-row":
      "min(4.5rem, max(2.25rem, calc((100dvh - var(--quiz-pad-height, 10rem) - 4.5rem) / var(--v-fret-count, 12))))",
  },
  width: "100%",
  maxWidth: "26rem",
  display: "flex",
  flexDirection: "column",
  fontFamily: "var(--font-geist-mono)",
});

export const headerRow = style({
  display: "grid",
  gridTemplateColumns: "var(--v-num-col) repeat(6, minmax(0, 1fr))",
  paddingBottom: "0.25rem",
  fontSize: "0.85rem",
  fontWeight: 700,
  color: colors.dark.text,
  textAlign: "center",
});

export const scroller = style({
  maxHeight: "calc(100dvh - var(--quiz-pad-height, 10rem) - 3rem)",
  overflowY: "auto",
  overscrollBehavior: "contain",
  WebkitOverflowScrolling: "touch",
});

export const row = style({
  display: "grid",
  gridTemplateColumns: "var(--v-num-col) repeat(6, minmax(0, 1fr))",
  height: "var(--v-row)",
  position: "relative",
});

export const fretNumber = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.7rem",
  fontWeight: 600,
  color: colors.dark.textMuted,
  opacity: 0.5,
});

// Bigger, bolder, opaque numbers on the inlay (3, 5, 7…) frets.
export const fretNumberMarker = style({
  fontSize: "0.95rem",
  fontWeight: 800,
  opacity: 1,
});

export const cell = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.dark.fretboard,
  // The string runs down the middle of each column; the fret wire is the bottom edge.
  // An optional overlay-zone shade (--v-zone) sits under the string line.
  backgroundImage: `linear-gradient(to right, transparent calc(50% - 1px), ${stringLineColor} calc(50% - 1px), ${stringLineColor} calc(50% + 1px), transparent calc(50% + 1px)), linear-gradient(var(--v-zone, transparent), var(--v-zone, transparent))`,
  borderBottom: "2px solid var(--color-fret-line)",
});

// Out-of-scope cells: tint only the base colour (like the horizontal board's
// quizFretInactive), so the zone shade and string line drawn over it stay intact.
export const cellInactive = style({
  backgroundColor: `color-mix(in srgb, ${colors.dark.bg} 55%, ${colors.dark.fretboard})`,
});

export const firstRowNut = style({
  borderTop: `6px solid ${colors.dark.textMuted}`,
});

export const firstRowNoNut = style({
  borderTop: "2px solid var(--color-fret-line)",
});

export const inlay = style({
  position: "absolute",
  top: "50%",
  width: "0.6rem",
  height: "0.6rem",
  borderRadius: borderRadius.full,
  backgroundColor: "var(--color-fret-marker)",
  transform: "translate(-50%, -50%)",
  pointerEvents: "none",
});

const pulse = keyframes({
  "0%": {
    boxShadow: `0 0 0 0 color-mix(in srgb, ${colors.dark.accent} 60%, transparent)`,
  },
  "100%": {
    boxShadow: `0 0 0 0.6rem color-mix(in srgb, ${colors.dark.accent} 0%, transparent)`,
  },
});

export const marker = style({
  position: "relative",
  zIndex: 1,
  width: "min(2.4rem, calc(var(--v-row) - 0.35rem))",
  height: "min(2.4rem, calc(var(--v-row) - 0.35rem))",
  borderRadius: borderRadius.full,
  border: `2px solid ${colors.dark.textMuted}`,
  background: colors.dark.surface,
  color: colors.dark.text,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.85rem",
  fontWeight: 700,
});

export const markerActive = style({
  borderColor: colors.dark.accent,
  borderWidth: "3px",
  background: `color-mix(in srgb, ${colors.dark.accent} 30%, ${colors.dark.surface})`,
  animationName: pulse,
  animationDuration: "1.2s",
  animationIterationCount: "infinite",
});

export const markerCorrect = style({
  borderColor: "#16a34a",
  background: "color-mix(in srgb, #16a34a 35%, var(--color-surface))",
});

export const markerWrong = style({
  borderColor: colors.dark.danger,
  background: `color-mix(in srgb, ${colors.dark.danger} 35%, ${colors.dark.surface})`,
});
