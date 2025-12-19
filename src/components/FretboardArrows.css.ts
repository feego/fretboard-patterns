import { style } from "@vanilla-extract/css";
import { borderRadius, colors, spacing } from "../styles/theme";

export const container = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.sm,
  paddingTop: `calc(${spacing.sm} + 5px)`,
  paddingBottom: `calc(${spacing.xs} + 15px)`,

  "@media": {
    "screen and (orientation: landscape) and (max-height: 450px)": {
      gap: spacing.xs,
      paddingTop: `calc(${spacing.xs} + 5px)`,
    },
  },
});

export const button = style({
  width: "2.5rem",
  height: "2.5rem",
  backgroundColor: colors.dark.surface,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  fontFamily: "var(--font-geist-mono)",
  fontSize: "1.1rem",
  fontWeight: "700",
  cursor: "pointer",
  userSelect: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,

  selectors: {
    "&:hover": {
      backgroundColor: colors.dark.accent,
      borderColor: colors.dark.accent,
    },
    "&:active": {
      backgroundColor: colors.dark.accentHover,
    },
    "&:focus": {
      outline: "none",
    },
    "&:focus-visible": {
      outline: `2px solid ${colors.dark.accent}`,
      outlineOffset: 2,
    },
  },

  "@media": {
    "screen and (orientation: landscape) and (max-height: 450px)": {
      width: "2.25rem",
      height: "2.25rem",
      fontSize: "1rem",
    },
  },
});
