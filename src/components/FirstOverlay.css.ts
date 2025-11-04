import { style } from "@vanilla-extract/css";
import { colors, borderRadius } from "../styles/theme";

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
  backgroundColor: colors.dark.surface, // Restore dark background
});

export const mainGrid = style([baseGrid, {
  gridTemplateColumns: "repeat(5, 1fr)",
  gridTemplateRows: "repeat(3, 1fr)",
}]);

export const secondGrid = style([baseGrid, {
  gridTemplateColumns: "repeat(5, 1fr)",
  gridTemplateRows: "repeat(2, 1fr)",
}]);

export const thirdGrid = style([baseGrid, {
  gridTemplateColumns: "repeat(5, 1fr)",
  gridTemplateRows: "repeat(1, 1fr)",
}]);

export const fourthGrid = style([baseGrid, {
  gridTemplateColumns: "repeat(7, 1fr)",
  gridTemplateRows: "repeat(1, 1fr)",
}]);

export const gridCell = style({
  width: "4rem",
  height: "3rem",
  backgroundColor: colors.dark.surface, // Restore dark background
  borderRadius: "0px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.875rem",
  fontWeight: "600",
  color: colors.dark.text,
  border: "none", // Remove all borders from cells
  margin: "0px",
  padding: "0px",
});

export const centerCell = style({
  backgroundColor: colors.dark.surface, // Same as regular cells
  color: colors.dark.text,
  border: "none", // Remove border from center cells too
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

export const fifthGrid = style([baseGrid, {
  gridTemplateColumns: "repeat(7, 1fr)",
  gridTemplateRows: "repeat(1, 1fr)",
}]);

export const overlayBottom = style({
  position: "absolute",
  pointerEvents: "none", 
  zIndex: 999,
  transform: "translate(-50%, -50%)",
  transition: "opacity 0.2s ease",
  filter: "none",
});
