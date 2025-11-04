import { style } from "@vanilla-extract/css";
import { colors, spacing } from "../styles/theme";

export const container = style({
  display: "flex",
  flexDirection: "column",
});

export const label = style({
  width: spacing.lg,
  height: "3rem",
  textAlign: "center",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.dark.surface,
  color: colors.dark.text,
  fontSize: "0.875rem",
  borderRight: `1px solid ${colors.dark.border}`,
});
