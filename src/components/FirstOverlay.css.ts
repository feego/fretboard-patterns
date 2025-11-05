import { style } from "@vanilla-extract/css";
import { borderRadius, colors } from "../styles/theme";

export const overlay = style({
  position: "absolute",
  pointerEvents: "none",
  zIndex: 1000,
  transform: "translate(-50%, -50%)",
  transition: "opacity 0.2s ease",
  filter: "none", // Add shadow to the entire overlay component
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
  backgroundColor: "rgba(0, 0, 0, 0.35)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
});

export const mainGrid = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateRows: "repeat(3, 1fr)",
  },
]);

export const secondGrid = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateRows: "repeat(2, 1fr)",
  },
]);

export const thirdGrid = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
  },
]);

export const fourthGrid = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(7, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
  },
]);

export const gridCell = style({
  width: "4rem",
  height: "3rem",
  backgroundColor: "var(--overlay-bg, transparent)",
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
  backgroundColor: "var(--overlay-bg, transparent)",
  color: colors.dark.text,
  border: "none",
});

export const sharpNote = style({
  opacity: 0.5,
  color: colors.dark.textMuted,
});

export const dimmedNote = style({
  opacity: 0.5,
  color: colors.dark.textMuted,
});

export const highlightedNote = style({
  opacity: 1,
  color: "white",
});

export const emptyCell = style({
  opacity: 0,
  pointerEvents: "none",
});

export const secondGridFirstRow = style({
  borderLeft: "none", // Remove left blue border for first row of second overlay
  borderRight: "none", // Remove right blue border for first row of second overlay
});

export const secondGridSecondRow = style({
  borderLeft: "none", // Remove left blue border for second row of second overlay
});

export const fifthGrid = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(7, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
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

// String-specific grids - FirstOverlay
export const string0Grid5 = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
  },
]);

export const string1Grid7 = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(7, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
  },
]);

export const string2Grid5 = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
  },
]);

export const string3Grid7 = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(7, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
  },
]);

export const string4Grid5 = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
  },
]);

export const string5Grid7 = style([
  baseGrid,
  {
    gridTemplateColumns: "repeat(7, 1fr)",
    gridTemplateRows: "repeat(1, 1fr)",
  },
]);

export const overlayBottom = style({
  position: "absolute",
  pointerEvents: "none",
  zIndex: 999,
  transform: "translate(-50%, -50%)",
  transition: "opacity 0.2s ease",
  filter: "none",
});

// Theme variants to toggle backgrounds
export const cellBgA = style({
  backgroundColor: colors.dark.surface,
});

export const cellBgB = style({
  backgroundColor: colors.dark.fretboard,
});

export const overlayBgA = style({
  backgroundColor: colors.dark.surface,
});

export const overlayBgB = style({
  backgroundColor: colors.dark.fretboard,
});

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
