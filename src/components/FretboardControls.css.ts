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
    "screen and (orientation: landscape) and (max-height: 450px)": {
      flexWrap: "wrap",
      gap: spacing.sm,
      padding: spacing.sm,
      marginTop: spacing.sm,
    },
  },
});

export const button = style({
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
});

export const label = style({
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
    "screen and (orientation: landscape) and (max-height: 450px)": {
      padding: `${spacing.xs} ${spacing.sm}`,
      fontSize: "0.8rem",
    },
  },
});
