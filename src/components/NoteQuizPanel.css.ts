import { globalStyle, style } from "@vanilla-extract/css";
import { borderRadius, colors, spacing } from "../styles/theme";

export const panel = style({
  width: "min(90rem, 100%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: spacing.sm,
  marginTop: spacing.sm,
  fontFamily: "var(--font-geist-mono)",
  color: colors.dark.text,
});

export const settingsBar = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: spacing.sm,
});

export const group = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: colors.dark.textMuted,
});

export const segment = style({
  display: "inline-flex",
  margin: 0,
  padding: 0,
  minWidth: 0,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  overflow: "hidden",
});

export const segmentButton = style({
  fontFamily: "inherit",
  height: "2.25rem",
  padding: `0 ${spacing.sm}`,
  backgroundColor: colors.dark.surface,
  color: colors.dark.text,
  border: "none",
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer",
  ":hover": {
    backgroundColor: `color-mix(in srgb, ${colors.dark.accent} 35%, ${colors.dark.surface})`,
  },
});

export const segmentButtonActive = style({
  backgroundColor: colors.dark.accent,
  ":hover": {
    backgroundColor: colors.dark.accentHover,
  },
});

// Shown above the prompt row when auto-next is off.
export const nextButton = style({
  fontFamily: "inherit",
  // As wide as the answer grid.
  width: "min(48rem, 100%)",
  height: "2.5rem",
  backgroundColor: colors.dark.accent,
  color: colors.dark.text,
  border: "none",
  borderRadius: borderRadius.md,
  fontSize: "0.9rem",
  fontWeight: 700,
  cursor: "pointer",
  ":hover": {
    backgroundColor: colors.dark.accentHover,
  },
});

export const fretInput = style({
  fontFamily: "inherit",
  width: "3.25rem",
  height: "2.25rem",
  padding: "0 0.375rem",
  backgroundColor: colors.dark.surface,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  fontSize: "0.85rem",
  fontWeight: 600,
  textAlign: "center",
});

export const keySelect = style([
  fretInput,
  {
    width: "auto",
    minWidth: "3.25rem",
    flexShrink: 0,
    textAlign: "center",
    textAlignLast: "center",
    cursor: "pointer",
    // No dropdown arrow.
    appearance: "none",
    WebkitAppearance: "none",
  },
]);

export const promptRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
});

export const linkButton = style({
  fontFamily: "inherit",
  background: "none",
  border: "none",
  padding: "0.25rem",
  color: colors.dark.textMuted,
  fontSize: "0.75rem",
  textDecoration: "underline",
  cursor: "pointer",
  ":hover": {
    color: colors.dark.text,
  },
});

export const prompt = style({
  minHeight: "1.5rem",
  fontSize: "1rem",
  fontWeight: 600,
  textAlign: "center",
});

export const promptCorrect = style({
  color: "#16a34a",
});

export const promptWrong = style({
  color: colors.dark.danger,
});

export const answerGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
  gap: "0.375rem",
  width: "min(48rem, 100%)",

  "@media": {
    "screen and (max-width: 600px)": {
      gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
    },
  },
});

export const answerButton = style({
  fontFamily: "inherit",
  height: "3rem",
  padding: 0,
  backgroundColor: colors.dark.surface,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  fontSize: "0.9rem",
  fontWeight: 700,
  lineHeight: 1.05,
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  transition: "background-color 0.15s ease, border-color 0.15s ease",
  ":hover": {
    borderColor: colors.dark.accent,
  },
  ":disabled": {
    cursor: "default",
  },
});

// Chord names are longer than note names ("Bm7♭5"), so they need to fit narrower buttons.
export const answerButtonChord = style({
  whiteSpace: "nowrap",
  "@media": {
    "screen and (max-width: 600px)": {
      fontSize: "0.72rem",
      letterSpacing: "-0.02em",
    },
  },
});

// Long names ("Ebm7♭5", "DbmMaj7") step down further on phones.
export const answerButtonChordLong = style({
  "@media": {
    "screen and (max-width: 600px)": {
      fontSize: "0.6rem",
    },
  },
});

export const answerButtonChordXLong = style({
  "@media": {
    "screen and (max-width: 600px)": {
      fontSize: "0.5rem",
    },
  },
});

export const answerButtonAlt = style({
  fontSize: "0.7rem",
  fontWeight: 600,
  color: colors.dark.textMuted,
});

export const answerButtonPending = style({
  borderColor: colors.dark.accent,
  backgroundColor: `color-mix(in srgb, ${colors.dark.accent} 25%, ${colors.dark.surface})`,
});

export const answerButtonCorrect = style({
  borderColor: "#16a34a",
  backgroundColor: "color-mix(in srgb, #16a34a 30%, var(--color-surface))",
});

export const answerButtonWrong = style({
  borderColor: colors.dark.danger,
  backgroundColor: `color-mix(in srgb, ${colors.dark.danger} 30%, ${colors.dark.surface})`,
});

export const scoreRow = style({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: spacing.md,
  fontSize: "0.8rem",
  color: colors.dark.textMuted,
});

export const scoreValue = style({
  color: colors.dark.text,
  fontWeight: 700,
});

export const hint = style({
  fontSize: "0.7rem",
  color: colors.dark.textMuted,
  textAlign: "center",
});

export const panelCompact = style({
  marginTop: 0,
  gap: spacing.xs,
});

export const compactTopRow = style({
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: spacing.xs,
});

export const compactPrompt = style({
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  fontSize: "0.9rem",
  textAlign: "left",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const compactScore = style({
  fontSize: "0.8rem",
  fontWeight: 700,
  color: colors.dark.textMuted,
  whiteSpace: "nowrap",
});

export const compactButton = style({
  height: "2rem",
  padding: `0 ${spacing.xs}`,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
});

// Bigger tap targets in the compact pad; one row of 12 when there's width for it.
globalStyle(`${panelCompact} ${answerGrid}`, {
  width: "100%",
  gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
});

globalStyle(`${panelCompact} ${answerButton}`, {
  height: "2.75rem",
});

globalStyle(`${panelCompact} ${answerGrid}`, {
  "@media": {
    "screen and (min-width: 600px)": {
      gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    },
  },
});

globalStyle(`${panelCompact} ${answerButton}`, {
  "@media": {
    "screen and (max-height: 500px)": {
      height: "2.25rem",
    },
  },
});
