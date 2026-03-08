import { style } from "@vanilla-extract/css";
import { borderRadius, colors, spacing } from "../styles/theme";

const dimmedFretboardBg =
  `color-mix(in srgb, ${colors.dark.fretboard} 70%, ${colors.dark.bg})` as any;

export const container = style({
  display: "flex",
  flexDirection: "column",
  gap: 0,
  alignItems: "center",
  justifyContent: "center",
  padding: spacing.md,
  marginTop: 0,

  "@media": {
    "screen and (max-width: 600px)": {
      alignItems: "center",
      marginTop: 0,
      padding: 0,
      gap: spacing.sm,
    },
    "screen and (orientation: landscape) and (max-height: 450px)": {
      gap: spacing.sm,
      padding: spacing.sm,
      marginTop: spacing.sm,
    },
  },
});

export const row = style({
  display: "flex",
  gap: spacing.md,
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",

  "@media": {
    "screen and (max-width: 600px)": {
      flexDirection: "column",
      gap: spacing.sm,
      width: "100%",
    },
    "screen and (orientation: landscape) and (max-height: 450px)": {
      flexWrap: "wrap",
      gap: spacing.sm,
    },
  },
});

export const button = style({
  fontFamily: "var(--font-geist-mono)",
  padding: `${spacing.sm} ${spacing.md}`,
  backgroundColor: colors.dark.surface,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  fontSize: "0.875rem",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s ease",
  ":hover": {
    backgroundColor: colors.dark.accent,
    borderColor: colors.dark.accent,
  },
  ":active": {
    backgroundColor: colors.dark.accentHover,
  },

  "@media": {
    "screen and (max-width: 600px)": {
      width: "min(22rem, 100%)",
    },
    "screen and (orientation: landscape) and (max-height: 450px)": {
      padding: `${spacing.xs} ${spacing.sm}`,
      fontSize: "0.8rem",
    },
  },
});

export const toggleLabel = style({
  display: "flex",
  alignItems: "center",
  gap: spacing.sm,
  fontFamily: "var(--font-geist-mono)",
  height: "2.5rem",
  padding: `0 ${spacing.md}`,
  backgroundColor: colors.dark.surface,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  fontSize: "0.875rem",
  fontWeight: "600",
  cursor: "pointer",
  userSelect: "none",
  transition: "all 0.2s ease",
  whiteSpace: "nowrap",
  ":hover": {
    borderColor: colors.dark.accent,
  },

  "@media": {
    "screen and (max-width: 600px)": {
      width: "min(22rem, 100%)",
      justifyContent: "flex-start",
    },
    "screen and (orientation: landscape) and (max-height: 450px)": {
      height: "2.25rem",
      padding: `0 ${spacing.sm}`,
      fontSize: "0.8rem",
    },
  },
});

export const toggleCheckbox = style({
  width: "1.05rem",
  height: "1.05rem",
  accentColor: colors.dark.accent,
  cursor: "pointer",
});

export const toggleText = style({
  lineHeight: 1.1,
});

export const selectWrapper = style({
  display: "flex",
  alignItems: "center",
  gap: spacing.sm,

  "@media": {
    "screen and (max-width: 600px)": {
      width: "min(22rem, 100%)",
      justifyContent: "space-between",
    },
  },
});

export const floatingSelector = style({
  position: "fixed",
  top: spacing.md,
  right: spacing.md,
  zIndex: 5000,
  padding: 0,
  borderRadius: 0,
  backgroundColor: "transparent",
  border: "none",

  "@media": {
    "screen and (max-width: 600px)": {
      position: "static",
      top: "auto",
      right: "auto",
      zIndex: "auto",
      padding: 0,
      borderRadius: 0,
      backgroundColor: "transparent",
      border: "none",
    },
  },
});

export const label = style({
  fontFamily: "var(--font-geist-mono)",
  color: colors.dark.text,
  fontSize: "0.875rem",
  fontWeight: "600",

  "@media": {
    "screen and (orientation: landscape) and (max-height: 450px)": {
      fontSize: "0.8rem",
    },
  },
});

export const select = style({
  fontFamily: "var(--font-geist-mono)",
  padding: `${spacing.sm} ${spacing.md}`,
  backgroundColor: colors.dark.surface,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  fontSize: "0.875rem",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s ease",
  ":hover": {
    borderColor: colors.dark.accent,
  },
  ":focus": {
    outline: "none",
    borderColor: colors.dark.accent,
  },

  "@media": {
    "screen and (max-width: 600px)": {
      flex: 1,
    },
    "screen and (orientation: landscape) and (max-height: 450px)": {
      padding: `${spacing.xs} ${spacing.sm}`,
      fontSize: "0.8rem",
    },
  },
});

export const input = style({
  fontFamily: "var(--font-geist-mono)",
  padding: `${spacing.sm} ${spacing.md}`,
  backgroundColor: colors.dark.surface,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  fontSize: "0.875rem",
  fontWeight: "600",
  transition: "all 0.2s ease",
  width: "8rem",
  ":hover": {
    borderColor: colors.dark.accent,
  },
  ":focus": {
    outline: "none",
    borderColor: colors.dark.accent,
  },

  "::placeholder": {
    color: colors.dark.textMuted,
  },

  "::-webkit-outer-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },
  "::-webkit-inner-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },

  "@media": {
    "screen and (max-width: 600px)": {
      flex: 1,
      width: "auto",
    },
    "screen and (orientation: landscape) and (max-height: 450px)": {
      padding: `${spacing.xs} ${spacing.sm}`,
      fontSize: "0.8rem",
    },
  },
});

export const section = style({
  width: "100%",
  maxWidth: "90rem",
  padding: 0,
  border: "none",
  borderRadius: 0,
  backgroundColor: "transparent",
  overflow: "visible",
  marginBottom: spacing.lg,

  "@media": {
    "screen and (max-width: 600px)": {
      padding: 0,
    },
  },
});

export const chordsTopRightRow = style({
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  gap: spacing.sm,
  width: "100%",
  maxWidth: "90rem",
  marginLeft: "auto",
  marginRight: "auto",
  marginBottom: spacing.sm,

  "@media": {
    "screen and (max-width: 600px)": {
      flexWrap: "wrap",
      justifyContent: "center",
    },
  },
});

export const songPicker = style({
  display: "flex",
  alignItems: "center",
  gap: spacing.xs,
  marginLeft: "auto",

  "@media": {
    "screen and (max-width: 600px)": {
      marginLeft: 0,
    },
  },
});

export const songPickerSaving = style({
  flexDirection: "column",
  alignItems: "flex-start",
});

export const songPickerRow = style({
  display: "flex",
  alignItems: "center",
  gap: spacing.xs,
});

export const songSelect = style({
  fontFamily: "var(--font-geist-mono)",
  padding: `${spacing.xs} ${spacing.sm}`,
  backgroundColor: colors.dark.surface,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  fontSize: "0.8rem",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s ease",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  backgroundImage: "none",
  ":hover": {
    borderColor: colors.dark.accent,
  },
  ":focus": {
    outline: "none",
    borderColor: colors.dark.accent,
  },
});

export const songNameInput = style({
  fontFamily: "var(--font-geist-mono)",
  padding: `${spacing.xs} ${spacing.sm}`,
  backgroundColor: colors.dark.fretboard,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  fontSize: "0.8rem",
  fontWeight: "700",
  width: "12rem",
  ":focus": {
    outline: "none",
    borderColor: colors.dark.accent,
  },

  "@media": {
    "screen and (max-width: 600px)": {
      width: "10rem",
    },
  },
});

export const metronomeControls = style({
  display: "flex",
  alignItems: "center",
  gap: spacing.sm,
  padding: 0,
  border: "none",
  borderRadius: 0,
  backgroundColor: "transparent",
});

export const metronomeButton = style({
  fontFamily: "var(--font-geist-mono)",
  padding: `${spacing.xs} ${spacing.sm}`,
  backgroundColor: colors.dark.surface,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  fontSize: "0.8rem",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s ease",
  ":hover": {
    backgroundColor: colors.dark.accent,
    borderColor: colors.dark.accent,
  },
  ":active": {
    backgroundColor: colors.dark.accentHover,
  },
  ":disabled": {
    opacity: 0.45,
    cursor: "not-allowed",
  },
  selectors: {
    "&:disabled:hover": {
      backgroundColor: colors.dark.surface,
      borderColor: colors.dark.border,
    },
  },
});

export const metronomeLabel = style({
  fontFamily: "var(--font-geist-mono)",
  color: colors.dark.textMuted,
  fontSize: "0.8rem",
  fontWeight: "700",
});

export const metronomeInput = style({
  fontFamily: "var(--font-geist-mono)",
  padding: `${spacing.xs} ${spacing.sm}`,
  backgroundColor: colors.dark.fretboard,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  fontSize: "0.8rem",
  fontWeight: "700",
  width: "5.5rem",
  ":focus": {
    outline: "none",
    borderColor: colors.dark.accent,
  },

  "::-webkit-outer-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },
  "::-webkit-inner-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },
});

export const sectionHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.md,
  flexWrap: "wrap",
  marginBottom: spacing.md,
});

export const sectionFooter = style({
  display: "flex",
  justifyContent: "flex-end",
  marginTop: spacing.md,
});

export const sectionButtons = style({
  display: "flex",
  gap: spacing.sm,
  alignItems: "center",
});

export const smallButton = style({
  fontFamily: "var(--font-geist-mono)",
  padding: `${spacing.xs} ${spacing.sm}`,
  backgroundColor: colors.dark.surface,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  fontSize: "0.8rem",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s ease",
  ":hover": {
    backgroundColor: colors.dark.accent,
    borderColor: colors.dark.accent,
  },
  ":active": {
    backgroundColor: colors.dark.accentHover,
  },
  ":disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
  },
});

export const barsGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
  gap: 0,
  rowGap: 0,
  boxSizing: "border-box",

  "@media": {
    "screen and (min-width: 900px)": {
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    },
  },
});

export const barCell = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  paddingLeft: spacing.xs,
  paddingRight: spacing.xs,
  paddingTop: "2px",
  paddingBottom: "5px",
  borderRadius: 0,
  // Slightly dimmer than the base fretboard color.
  backgroundColor: dimmedFretboardBg,
  // Use a single-sided 1px divider to avoid doubled borders between bars.
  borderLeft:
    `2px solid color-mix(in srgb, ${colors.dark.border} 52%, transparent)` as any,
  borderTop:
    `0.5px solid color-mix(in srgb, ${colors.dark.border} 55%, transparent)` as any,
  borderRight: "none",
  borderBottom:
    `0.5px solid color-mix(in srgb, ${colors.dark.border} 55%, transparent)` as any,
});

export const barSeekHandle = style({
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  width: "0.75rem",
  background: "transparent",
  border: "none",
  padding: 0,
  margin: 0,
  cursor: "pointer",
  zIndex: 60,

  selectors: {
    "&:focus-visible": {
      outline: `2px solid color-mix(in srgb, ${colors.dark.accent} 70%, transparent)` as any,
      outlineOffset: "2px",
    },
  },
});

export const barCellActive = style({
  selectors: {
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      border: `2px solid color-mix(in srgb, ${colors.dark.accent} 55%, transparent)` as any,
      borderRadius: borderRadius.md,
      boxSizing: "border-box",
      zIndex: 5,
    },
  },
});

export const barCellTopLeft = style({
  borderTopLeftRadius: borderRadius.md,
});

export const barCellTopRight = style({
  borderTopRightRadius: borderRadius.md,
});

export const barCellBottomLeft = style({
  borderBottomLeftRadius: borderRadius.md,
});

export const barCellBottomRight = style({
  borderBottomRightRadius: borderRadius.md,
});

export const barMenu = style({
  position: "absolute",
  top: 0,
  right: spacing.xs,
  display: "inline-flex",
  gap: 0,
  backgroundColor: colors.dark.surface,
  border:
    `1px solid color-mix(in srgb, ${colors.dark.border} 55%, transparent)` as any,
  borderRadius: borderRadius.md,
  overflow: "hidden",
  padding: "2px",
  opacity: 0,
  pointerEvents: "none",
  zIndex: 50,
  // Keep it above the bar so it doesn't cover the beat inputs.
  // Nudge: +6px down, +20px right.
  transform: "translateX(20px) translateY(-100%)",
  transition: "opacity 140ms ease, transform 140ms ease",

  selectors: {
    [`${barCell}:hover &`]: {
      opacity: 1,
      pointerEvents: "auto",
      transform: "translateX(20px) translateY(calc(-100% + 6px))",
    },
    "&:hover": {
      opacity: 1,
      pointerEvents: "auto",
      transform: "translateX(20px) translateY(calc(-100% + 6px))",
    },
  },
});

export const barMenuButton = style({
  fontFamily: "var(--font-geist-mono)",
  width: "1.9rem",
  height: "1.6rem",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  backgroundColor: "transparent",
  color: colors.dark.text,
  border: "none",
  borderRadius: borderRadius.md,
  fontSize: "0.95rem",
  fontWeight: "700",
  lineHeight: 1,
  cursor: "pointer",
  ":hover": {
    backgroundColor:
      `color-mix(in srgb, ${colors.dark.border} 28%, transparent)` as any,
  },
  ":disabled": {
    opacity: 0.45,
    cursor: "not-allowed",
  },

  selectors: {
    [`${barMenu} &:not(:last-child)`]: {
      marginRight: "2px",
    },
  },
});

export const barMenuButtonDanger = style({
  backgroundColor: colors.dark.danger,
  color: colors.dark.text,

  ":hover": {
    backgroundColor:
      `color-mix(in srgb, ${colors.dark.danger} 85%, ${colors.dark.surface})` as any,
  },
});

export const barCellLast = style({
  // Render the last-bar "double line" *outside* the bar box.
  borderRight: "none",

  selectors: {
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      bottom: 0,
      left: "calc(100% + 4px)",
      width: 4,
      pointerEvents: "none",
      backgroundColor: colors.dark.border,
      borderRadius: borderRadius.md,
      // Keep the line below the bar +/- hover menu (which is z-index: 50).
      zIndex: 20,
    },
  },
});

export const barCellRightEdge = style({
  borderRight:
    `2px solid color-mix(in srgb, ${colors.dark.border} 75%, transparent)` as any,
});

export const barBeatGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  width: "100%",
  overflow: "visible",
});

export const beatCell = style({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  paddingLeft: spacing.xs,
  overflow: "visible",
  minWidth: 0,

  selectors: {
    "&::before": {
      content: "\"\"",
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 1,
      backgroundColor:
        `color-mix(in srgb, ${colors.dark.border} 22%, transparent)` as any,
      pointerEvents: "none",
      zIndex: 0,
    },
    "&:first-child::before": {
      display: "none",
    },
  },
});

export const beatCellError = style({
  selectors: {
    "&:hover": {
      zIndex: 80,
    },
    "&:focus-within": {
      zIndex: 80,
    },
  },
});

export const chordErrorTooltip = style({
  position: "absolute",
  left: spacing.xs,
  top: "100%",
  transform: "translateY(4px)",
  display: "inline-flex",
  alignItems: "center",
  gap: spacing.xs,
  backgroundColor: colors.dark.danger,
  border: "none",
  borderRadius: borderRadius.md,
  padding: "2px 6px",
  color: colors.dark.text,
  fontFamily: "var(--font-geist-mono)",
  fontSize: "0.75rem",
  fontWeight: "700",
  whiteSpace: "nowrap",
  opacity: 0,
  pointerEvents: "none",
  zIndex: 90,
  transition: "opacity 140ms ease, transform 140ms ease",

  selectors: {
    [`${beatCellError}:hover &`]: {
      opacity: 1,
      transform: "translateY(8px)",
    },
    [`${beatCellError}:focus-within &`]: {
      opacity: 1,
      transform: "translateY(8px)",
    },
  },
});

export const beatKeyInput = style({
  fontFamily: "var(--font-geist-mono)",
  padding: 0,
  paddingRight: spacing.sm,
  backgroundColor: dimmedFretboardBg,
  color: colors.dark.textMuted,
  border: "none",
  fontSize: "0.8rem",
  fontWeight: "700",
  display: "block",
  width: "100%",
  lineHeight: 1.05,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "clip",
  position: "relative",
  zIndex: 1,
  ":focus": {
    outline: "none",
  },
  "::placeholder": {
    color: colors.dark.textMuted,
  },
});

export const beatKeyRow = style({
  display: "flex",
  alignItems: "baseline",
  gap: "0.35rem",
  width: "100%",
  minWidth: 0,
});

export const beatKeyInlineLabel = style({
  fontFamily: "var(--font-geist-mono)",
  color: colors.dark.textMuted,
  fontSize: "0.7rem",
  fontWeight: "800",
  lineHeight: 1,
  letterSpacing: "0.04em",
  userSelect: "none",
  flex: "0 0 auto",
});

export const beatKeyInputWithLabel = style([
  beatKeyInput,
  {
    flex: 1,
    minWidth: 0,
  },
]);

// Ensures long chord text from earlier beats can overlap later beat separators
// (native <input> can't truly overflow its own box, so we avoid a "cut" look).
export const beatCell0 = style({ zIndex: 4 });
export const beatCell1 = style({ zIndex: 3 });
export const beatCell2 = style({ zIndex: 2 });
export const beatCell3 = style({ zIndex: 1 });

export const beatChordInput = style({
  fontFamily: "var(--font-geist-mono)",
  padding: 0,
  paddingRight: spacing.sm,
  backgroundColor: dimmedFretboardBg,
  color: colors.dark.text,
  border: "none",
  fontSize: "1rem",
  fontWeight: "600",
  display: "block",
  width: "100%",
  maxWidth: "none",
  lineHeight: 1.1,
  whiteSpace: "nowrap",
  overflow: "visible",
  textOverflow: "clip",
  position: "relative",
  zIndex: 1,
  ":focus": {
    outline: "none",
  },
  "::placeholder": {
    color: colors.dark.textMuted,
  },
});

export const beatChordInputInvalid = style({
  color: colors.dark.danger,
});
