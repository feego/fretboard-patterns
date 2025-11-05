import { style } from "@vanilla-extract/css";
import { colors, borderRadius } from "../styles/theme";

export const overlay = style({
  position: "fixed",
  pointerEvents: "none",
  zIndex: 1001,
  transform: "translate(-50%, -50%)",
  transition: "opacity 0.2s ease",
});

export const visible = style({
  opacity: 1,
});

export const hidden = style({
  opacity: 0,
});

export const grid = style({
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gridTemplateRows: "repeat(2, 1fr)", // 5x2 grid
  gap: "0px", // Remove gap to fit exactly
  padding: "0px", // Remove padding
  backgroundColor: "rgba(0, 255, 0, 0.8)", // Green background for debugging
  borderRadius: borderRadius.md,
  // border: `2px solid ${colors.dark.accent}`, // Remove blue border
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
});

export const gridCell = style({
  width: "2.5rem", // Exact match to fretboard fret width
  height: "3rem", // Exact match to fretboard fret height
  backgroundColor: colors.dark.surface,
  borderRadius: "0px", // Remove border radius for exact fit
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.875rem",
  fontWeight: "600",
  color: colors.dark.text,
  border: `1px solid ${colors.dark.border}`,
  margin: "0px", // Remove any margin
  padding: "0px", // Remove any padding
});

export const centerCell = style({
  backgroundColor: colors.dark.surface, // Same as regular cells
  color: colors.dark.text, // Same text color
  border: `1px solid ${colors.dark.border}`, // Same border as regular cells
});

export const sharpNote = style({
  opacity: 0.5, // Dim sharp notes
  color: colors.dark.textMuted, // Use muted text color
});

export const emptyCell = style({
  opacity: 0,
  pointerEvents: "none",
});
