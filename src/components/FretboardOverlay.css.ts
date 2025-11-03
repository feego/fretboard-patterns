import { style } from "@vanilla-extract/css";
import { colors, borderRadius } from "../styles/theme";

export const overlay = style({
  position: "fixed",
  pointerEvents: "none",
  zIndex: 1000,
  transform: "translate(-50%, -50%)",
  transition: "opacity 0.2s ease",
});

export const grid = style({
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gridTemplateRows: "repeat(3, 1fr)",
  gap: "1px", // Reduced gap to match fretboard line thickness
  padding: "4px",
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  borderRadius: borderRadius.md,
  border: `2px solid ${colors.dark.accent}`,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
});

export const gridCell = style({
  width: "2.5rem", // Match fretboard fret width
  height: "3rem",  // Match fretboard fret height
  backgroundColor: colors.dark.surface,
  borderRadius: borderRadius.sm,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.875rem", // Slightly larger font for better readability
  fontWeight: "600",
  color: colors.dark.text,
  border: `1px solid ${colors.dark.border}`,
});

export const centerCell = style({
  backgroundColor: colors.dark.accent,
  color: "white",
  border: `1px solid ${colors.dark.accentHover}`,
});

export const hidden = style({
  opacity: 0,
});

export const visible = style({
  opacity: 1,
});