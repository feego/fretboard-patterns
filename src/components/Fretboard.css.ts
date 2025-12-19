import { style } from "@vanilla-extract/css";
import { borderRadius, colors, spacing } from "../styles/theme";

export const container = style({
  // CSS variables used for responsive sizing across the fretboard + labels
  // (vanilla-extract doesn't have typed support for custom properties)
  // Keep stable base sizing; viewport fitting is handled by JS scaling.
  ["--fret-width" as any]: "4rem",
  ["--fret-height" as any]: "3rem",
  ["--label-width" as any]: "2rem",
  ["--page-title-size" as any]: "2.5rem",
  padding: spacing.lg,
  overflowX: "visible", // Allow overlays to extend beyond container
  overflowY: "visible",
  backgroundColor: colors.dark.bg,
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center", // Only horizontal centering
  paddingTop: spacing.xl, // Add some top spacing instead of vertical centering

  "@media": {
    // Small-landscape baseline reduction (in addition to JS scaling)
    "screen and (orientation: landscape) and (max-height: 450px)": {
      ["--fret-width" as any]: "3rem",
      ["--fret-height" as any]: "2.25rem",
      ["--label-width" as any]: "1.75rem",
      ["--page-title-size" as any]: "1.5rem",
      padding: spacing.sm,
      paddingTop: spacing.sm,
    },
  },
});

export const fretboard = style({
  display: "inline-block",
  backgroundColor: colors.dark.fretboard,
  minWidth: "fit-content", // Ensure fretboard doesn't compress
  position: "relative", // For absolute positioning of markers
  overflow: "hidden", // Clip overlays at fretboard edges
});

export const fretboardWrapper = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

export const fretboardRow = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  border: `3px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)`,
  overflow: "hidden",
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
  width: "var(--fret-width, 4rem)",
  height: "var(--fret-height, 3rem)",
  borderRight: `1px solid ${colors.dark.border}`,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background-color 0.2s ease",
  fontSize: "0.75rem", // Smaller font for fret numbers
  fontWeight: "500",
  color: colors.dark.text,
  // No hover effect
  // No active effect
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
    transform:
      "translate(-50%, calc(-50% + (var(--fret-height, 3rem) / 2)))",
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
    transform:
      "translate(-50%, calc(-50% + (var(--fret-height, 3rem) / 2)))",
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
    transform:
      "translate(-50%, calc(-50% + (var(--fret-height, 3rem) / 2)))",
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
  fontSize: "var(--page-title-size, 2.5rem)",
  fontWeight: "bold",
  color: colors.dark.text,
  textAlign: "center",
  marginBottom: spacing.lg,

  "@media": {
    "screen and (max-width: 900px) and (max-height: 500px)": {
      marginBottom: spacing.sm,
    },
  },
});
