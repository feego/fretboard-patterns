import { style } from "@vanilla-extract/css";
import { borderRadius, colors, spacing } from "../styles/theme";

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
  marginBottom: spacing.sm,

  "@media": {
    "screen and (max-width: 600px)": {
      flexWrap: "wrap",
      justifyContent: "center",
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
  paddingRight: 6,
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
  padding: spacing.xs,
  borderRadius: 0,
  backgroundColor: colors.dark.fretboard,
  // Use a single-sided 1px divider to avoid doubled borders between bars.
  borderLeft:
    `2px solid color-mix(in srgb, ${colors.dark.border} 52%, transparent)` as any,
  borderTop:
    `1px solid color-mix(in srgb, ${colors.dark.border} 55%, transparent)` as any,
  borderRight: "none",
  borderBottom:
    `1px solid color-mix(in srgb, ${colors.dark.border} 55%, transparent)` as any,
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
  borderRight: "none",

  selectors: {
    "&::after": {
      content: "\"\"",
      position: "absolute",
      top: 0,
      bottom: 0,
      right: -6,
      width: 4,
      pointerEvents: "none",
      borderRadius: borderRadius.md,
      backgroundColor:
        `color-mix(in srgb, ${colors.dark.border} 70%, transparent)` as any,
    },
  },
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
        `color-mix(in srgb, ${colors.dark.border} 55%, transparent)` as any,
      pointerEvents: "none",
      zIndex: 0,
    },
    "&:first-child::before": {
      display: "none",
    },
  },
});

export const beatKeyInput = style({
  fontFamily: "var(--font-geist-mono)",
  padding: 0,
  paddingRight: spacing.sm,
  backgroundColor: colors.dark.fretboard,
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
  backgroundColor: colors.dark.fretboard,
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
