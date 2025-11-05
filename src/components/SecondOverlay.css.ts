import { style } from "@vanilla-extract/css";
import { colors, borderRadius } from "../styles/theme";

export const overlay = style({
  position: "absolute",
  // pointerEvents: "none", // Allow pointer events for cell click
  zIndex: 999,
  transform: "translate(-50%, -50%)",
  transition: "opacity 0.2s ease",
  backdropFilter: "blur(2px)",
  WebkitBackdropFilter: "blur(2px)",
});

export const visible = style({
  opacity: 1,
});

export const hidden = style({
  opacity: 0,
});

const baseGrid = style({
  display: "grid",
  gap: "0px",
  padding: "0px",
  borderRadius: borderRadius.md,
});

export const gridCell = style({
  width: "4rem",
  height: "3rem",
  backgroundColor: "transparent",
  borderRadius: "0px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.875rem",
  fontWeight: "600",
  color: colors.dark.text,
  border: "none",
  margin: "0px",
  padding: "0px",
});

export const centerCell = style({
  backgroundColor: "transparent",
  color: colors.dark.text,
  border: "none",
});

export const emptyCell = style({
  opacity: 0,
  pointerEvents: "none",
});

export const highlightedNote = style({
  opacity: 1,
  color: "white",
});

export const dimmedNote = style({
  opacity: 0.5,
  color: colors.dark.textMuted,
});

export const mainGrid = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateRows: "repeat(3, 1fr)",
  },
]);

export const topGrid = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(7, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
  },
]);

export const topGridBottom = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateRows: "repeat(2, 1fr)",
  },
]);

// Add left/right borders for 5-fret grids
export const fiveColBorders = style({
  borderLeft: `2px solid ${colors.dark.border}`,
  borderRight: `2px solid ${colors.dark.border}`,
});

// Add left/right borders for 7-fret grids
export const sevenColBorders = style({
  borderLeft: `2px solid ${colors.dark.border}`,
  borderRight: `2px solid ${colors.dark.border}`,
});

// Cell-level borders for first/last cells in a row
export const cellLeftBorder = style({
  borderLeft: `2px solid ${colors.dark.border}`,
});

export const cellRightBorder = style({
  borderRight: `2px solid ${colors.dark.border}`,
});

// Top border for the first two cells of 7-fret rows
export const cellTopBorder = style({
  borderTop: `2px solid ${colors.dark.border}`,
});

export const bottomGrid = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateRows: "repeat(2, 1fr)",
  },
]);

// Single row grids for splitting multi-row grids
export const singleRowGrid5 = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
  },
]);

export const singleRowGrid7 = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(7, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
  },
]);

// String-specific grids - SecondOverlay
export const string0Grid7 = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(7, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
  },
]);

export const string1Grid5 = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
  },
]);

export const string2Grid7 = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(7, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
  },
]);

export const string3Grid5 = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
  },
]);

export const string4Grid7 = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(7, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
  },
]);

export const string5Grid5 = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
  },
]);
