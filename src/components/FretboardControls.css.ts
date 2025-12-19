import { style } from "@vanilla-extract/css";
import { borderRadius, colors, spacing } from "../styles/theme";

export const container = style({
  display: "flex",
  gap: spacing.md,
  alignItems: "center",
  justifyContent: "center",
  padding: spacing.md,
  marginTop: spacing.md,

  "@media": {
    "screen and (max-width: 600px)": {
      flexDirection: "column",
      alignItems: "center",
      marginTop: 0,
      padding: 0,
      gap: spacing.sm,
    },
    "screen and (orientation: landscape) and (max-height: 450px)": {
      flexWrap: "wrap",
      gap: spacing.sm,
      padding: spacing.sm,
      marginTop: spacing.sm,
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
