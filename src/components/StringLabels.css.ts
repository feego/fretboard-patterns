import { style } from "@vanilla-extract/css";
import { colors, spacing } from "../styles/theme";

export const container = style({
  display: "flex",
  flexDirection: "column",
});

export const label = style({
  width: "var(--label-width, 2rem)",
  height: "var(--fret-height, 3rem)",
  textAlign: "center",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.dark.surface,
  color: colors.dark.text,
  fontSize: "0.875rem",
  borderRight: `1px solid ${colors.dark.border}`,

  "@media": {
    "screen and (max-width: 900px) and (max-height: 500px)": {
      fontSize: "0.75rem",
    },
  },
});
