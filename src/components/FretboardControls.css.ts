import { style } from "@vanilla-extract/css";
import { borderRadius, colors, spacing } from "../styles/theme";

export const container = style({
  display: "flex",
  flexDirection: "column",
  gap: spacing.md,
  alignItems: "center",
  justifyContent: "center",
  padding: spacing.md,
  marginTop: spacing.md,

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
