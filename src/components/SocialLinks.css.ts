import { style } from "@vanilla-extract/css";
import { borderRadius, spacing } from "../styles/theme";

export const container = style({
  position: "fixed",
  right: spacing.sm,
  bottom: spacing.sm,
  display: "flex",
  gap: spacing.xs,
  zIndex: 50,
});

export const link = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2.5rem",
  height: "2.5rem",
  borderRadius: borderRadius.full,
  color: "var(--foreground)",
  opacity: 0.9,
  outline: "none",
  selectors: {
    "&:hover": {
      opacity: 1,
    },
    "&:focus-visible": {
      opacity: 1,
    },
  },
});

export const icon = style({
  width: "1.25rem",
  height: "1.25rem",
  display: "block",
});
