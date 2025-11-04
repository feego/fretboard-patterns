import { style } from "@vanilla-extract/css";
import { colors, borderRadius } from "../styles/theme";

export const overlay = style({
  position: "fixed",
  pointerEvents: "none", 
  zIndex: 1000,
  transform: "translate(-50%, -50%)",
  transition: "opacity 0.2s ease",
  filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))",
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
  backgroundColor: "#3a3a3a",
});

export const gridCell = style({
  width: "2.5rem",
  height: "3rem",
  backgroundColor: "#3a3a3a",
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
  backgroundColor: "#3a3a3a",
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

export const mainGrid = style([baseGrid, {
  gridTemplateColumns: "repeat(5, 1fr)",
  gridTemplateRows: "repeat(3, 1fr)",
}]);

export const topGrid = style([baseGrid, {
  gridTemplateColumns: "repeat(7, 1fr)",
  gridTemplateRows: "repeat(1, 1fr)",
}]);

export const topGridBottom = style([baseGrid, {
  gridTemplateColumns: "repeat(5, 1fr)",
  gridTemplateRows: "repeat(2, 1fr)",
}]);

export const bottomGrid = style([baseGrid, {
  gridTemplateColumns: "repeat(5, 1fr)",
  gridTemplateRows: "repeat(2, 1fr)",
}]);