import { style } from "@vanilla-extract/css";
import { colors, spacing, borderRadius } from "../styles/theme";

export const container = style({
  padding: spacing.lg,
  overflowX: "auto", // Allow horizontal scrolling for long fretboard
  overflowY: "visible",
  backgroundColor: colors.dark.bg,
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center", // Only horizontal centering
  paddingTop: spacing.xl, // Add some top spacing instead of vertical centering
});

export const fretboard = style({
  display: "inline-block",
  border: `3px solid ${colors.dark.border}`,
  backgroundColor: colors.dark.fretboard,
  borderRadius: borderRadius.md,
  minWidth: "fit-content", // Ensure fretboard doesn't compress
  boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)`,
  position: "relative", // For absolute positioning of markers
});

export const fretboardWrapper = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

export const stringRow = style({
  display: "flex",
});

export const stringLabel = style({
  width: spacing.lg,
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

export const fret = style({
  width: "2.5rem", // Reduced from 4rem to fit more frets
  height: "3rem",
  borderRight: `1px solid ${colors.dark.border}`,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background-color 0.2s ease",
  fontSize: "0.75rem", // Smaller font for fret numbers
  fontWeight: "500",
  color: colors.dark.text,
  ":hover": {
    backgroundColor: colors.dark.accent,
  },
  ":active": {
    backgroundColor: colors.dark.accentHover,
  },
});

export const firstFret = style({
  borderLeft: `2px solid ${colors.dark.border}`,
});

export const markerFret = style({
  position: "relative",
  "::after": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, calc(-50% + 1.5rem))", // Shift down to center between D and G strings
    width: "8px",
    height: "8px",
    backgroundColor: colors.dark.text,
    borderRadius: borderRadius.full,
    zIndex: 1,
  },
});

export const doubleMarkerFret = style({
  position: "relative",
  "::after": {
    content: '""',
    position: "absolute",
    top: "30%",
    left: "50%",
    transform: "translate(-50%, calc(-50% + 1.5rem))", // Shift down to center between D and G strings
    width: "6px",
    height: "6px",
    backgroundColor: colors.dark.text,
    borderRadius: borderRadius.full,
    zIndex: 1,
  },
  "::before": {
    content: '""',
    position: "absolute",
    top: "70%",
    left: "50%",
    transform: "translate(-50%, calc(-50% + 1.5rem))", // Shift down to center between D and G strings
    width: "6px",
    height: "6px",
    backgroundColor: colors.dark.text,
    borderRadius: borderRadius.full,
    zIndex: 1,
  },
});

export const octaveFret = style({
  backgroundColor: colors.dark.surface,
  fontWeight: "bold",
});

export const fretNumber = style({
  position: "absolute",
  top: "-20px",
  fontSize: "0.6rem",
  color: colors.dark.textMuted,
  fontWeight: "600",
});

export const pageTitle = style({
  fontSize: "2.5rem",
  fontWeight: "bold",
  color: colors.dark.text,
  textAlign: "center",
  marginBottom: spacing.lg,
});