import { style } from "@vanilla-extract/css";
import { borderRadius, colors, spacing } from "../styles/theme";

export const container = style({
  // CSS variables used for responsive sizing across the fretboard + labels
  // (vanilla-extract doesn't have typed support for custom properties)
  // Keep stable base sizing; viewport fitting is handled by JS scaling.
  ["--fret-width" as any]: "4rem",
  ["--fret-height" as any]: "3rem",
  ["--label-width" as any]: "2rem",
  ["--page-title-size" as any]: "2rem",
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
    // Mobile portrait/narrow screens
    "screen and (max-width: 600px)": {
      ["--page-title-size" as any]: "1.25rem",
    },
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

export const header = style({
  width: "min(90rem, 100%)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: spacing.md,
  marginBottom: spacing.sm,

  "@media": {
    "screen and (max-width: 900px)": {
      gridTemplateColumns: "1fr",
      justifyItems: "center",
      gap: spacing.sm,
    },
    "screen and (orientation: landscape) and (max-height: 450px)": {
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
  },
});

export const headerTuning = style({
  display: "flex",
  alignItems: "center",
  gap: spacing.sm,
});

export const headerTuningLabel = style({
  fontFamily: "var(--font-geist-mono)",
  color: colors.dark.text,
  fontSize: "0.875rem",
  fontWeight: "600",
});

export const headerTuningSelect = style({
  fontFamily: "var(--font-geist-mono)",
  padding: `${spacing.sm} ${spacing.md}`,
  backgroundColor: colors.dark.surface,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  fontSize: "0.875rem",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s ease",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  backgroundImage: "none",
  ":hover": {
    borderColor: colors.dark.accent,
  },
  ":focus": {
    outline: "none",
    borderColor: colors.dark.accent,
  },
});

export const arrowsDock = style({
  width: "min(90rem, 100%)",
  display: "flex",
  alignItems: "center",
  gap: spacing.md,
  justifyContent: "center",
  flexWrap: "wrap",
  marginTop: spacing.sm,
  marginBottom: 0,
});

export const arrowsDockButton = style({
  fontFamily: "var(--font-geist-mono)",
  height: "2.5rem",
  padding: `0 ${spacing.md}`,
  backgroundColor: colors.dark.surface,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  fontSize: "0.875rem",
  fontWeight: "600",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
  transition: "all 0.2s ease",
  ":hover": {
    backgroundColor: colors.dark.accent,
    borderColor: colors.dark.accent,
  },
  ":active": {
    backgroundColor: colors.dark.accentHover,
  },

  "@media": {
    "screen and (orientation: landscape) and (max-height: 450px)": {
      height: "2.25rem",
      padding: `0 ${spacing.sm}`,
      fontSize: "0.8rem",
    },
  },
});

export const headerCenter = style({
  justifySelf: "center",
});

export const headerRight = style({
  justifySelf: "end",

  "@media": {
    "screen and (max-width: 900px)": {
      justifySelf: "center",
    },
  },
});

export const metronomeControls = style({
  display: "flex",
  alignItems: "center",
  gap: spacing.sm,
  padding: spacing.xs,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  backgroundColor: colors.dark.surface,
});

export const metronomeButton = style({
  fontFamily: "var(--font-geist-mono)",
  padding: `${spacing.xs} ${spacing.sm}`,
  backgroundColor: colors.dark.surface,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  fontSize: "0.8rem",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s ease",
  ":hover": {
    backgroundColor: colors.dark.accent,
    borderColor: colors.dark.accent,
  },
  ":active": {
    backgroundColor: colors.dark.accentHover,
  },
});

export const metronomeLabel = style({
  fontFamily: "var(--font-geist-mono)",
  color: colors.dark.textMuted,
  fontSize: "0.8rem",
  fontWeight: "700",
});

export const metronomeInput = style({
  fontFamily: "var(--font-geist-mono)",
  padding: `${spacing.xs} ${spacing.sm}`,
  backgroundColor: colors.dark.fretboard,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  fontSize: "0.8rem",
  fontWeight: "700",
  width: "5.5rem",
  ":focus": {
    outline: "none",
    borderColor: colors.dark.accent,
  },
  "::-webkit-outer-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },
  "::-webkit-inner-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },
});

export const fretboard = style({
  display: "inline-block",
  backgroundColor: colors.dark.fretboard,
  minWidth: "fit-content", // Ensure fretboard doesn't compress
  position: "relative", // For absolute positioning of markers
  overflow: "hidden", // Clip overlays at fretboard edges
});

export const selectionLayer = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  zIndex: 2000,
});

export const selectionMarker = style({
  position: "absolute",
  left: 0,
  top: 0,
  transform: "translate(-50%, -50%)",
  width: "min(2.2rem, calc(var(--fret-height, 3rem) - 0.3rem))",
  height: "min(2.2rem, calc(var(--fret-height, 3rem) - 0.3rem))",
  borderRadius: borderRadius.full,
  border: `3px solid ${colors.dark.text}`,
  background: "rgba(229,229,229,0.18)",
});

// Chord-driven markers should be slightly lighter than manual selections.
export const chordSelectionMarker = style({
  position: "absolute",
  left: 0,
  top: 0,
  transform: "translate(-50%, -50%)",
  width: "min(2.2rem, calc(var(--fret-height, 3rem) - 0.3rem))",
  height: "min(2.2rem, calc(var(--fret-height, 3rem) - 0.3rem))",
  borderRadius: borderRadius.full,
  border: `2px solid ${colors.dark.text}`,
  background: "rgba(229,229,229,0.16)",
});

export const selectionMarkerNonRoot = style({
  border: `1.5px solid color-mix(in srgb, ${colors.dark.text} 35%, transparent)` as any,
  background: `color-mix(in srgb, ${colors.dark.text} 5%, transparent)` as any,
});

export const selectionMarkerDim = style({
  // Keep dim markers extremely subtle but still visible.
  // Use color-mix with transparent so only border/fill are faint,
  // without making the whole element effectively disappear.
  border: `1px solid color-mix(in srgb, ${colors.dark.textMuted} 10%, transparent)` as any,
  background: `color-mix(in srgb, ${colors.dark.textMuted} 1.25%, transparent)` as any,
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

export const cagedFret = style({
  backgroundColor: `color-mix(in srgb, ${colors.dark.accent} 18%, transparent)`,
  border: "none",
  borderRadius: borderRadius.md,
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
    backgroundColor: `color-mix(in srgb, ${colors.dark.textMuted} 60%, transparent)`,
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
    backgroundColor: `color-mix(in srgb, ${colors.dark.textMuted} 60%, transparent)`,
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
    backgroundColor: `color-mix(in srgb, ${colors.dark.textMuted} 60%, transparent)`,
    borderRadius: borderRadius.full,
    zIndex: 1,
  },
});

export const octaveFret = style({
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
  fontFamily: "var(--font-geist-mono)",
  fontWeight: "500",
  textTransform: "uppercase",
  color: colors.dark.text,
  textAlign: "center",
  marginBottom: 0,

  "@media": {
    "screen and (max-width: 900px) and (max-height: 500px)": {
      marginBottom: 0,
    },
  },
});
