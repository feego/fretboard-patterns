import { style } from "@vanilla-extract/css";
import { borderRadius, colors, spacing } from "../styles/theme";

export const wrapper = style({
  display: "flex",
  alignItems: "center",
  position: "relative",
});

export const iframeContainer = style({
  position: "fixed",
  width: 0,
  height: 0,
  overflow: "hidden",
  pointerEvents: "none",
  opacity: 0,
});

export const controls = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: spacing.xs,
});

export const ytPanelWrapper = style({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  height: "2.5rem",
});

// Applied on mobile when the panel is expanded — makes the wrapper take a full row
// so the YT controls never overlap the metronome row.
export const ytPanelWrapperExpanded = style({
  "@media": {
    "screen and (max-width: 600px)": {
      width: "100%",
    },
  },
});

export const toggleButton = style({
  fontFamily: "var(--font-geist-mono)",
  padding: `${spacing.xs} ${spacing.sm}`,
  backgroundColor: colors.dark.surface,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  fontSize: "0.8rem",
  fontWeight: "700",
  cursor: "pointer",
  whiteSpace: "nowrap",
  position: "relative",
  zIndex: 101,
  transition: "border-color 0.15s ease",
  ":hover": {
    borderColor: colors.dark.accent,
  },
});

const panelBase = {
  position: "absolute" as const,
  top: 0,
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  gap: spacing.xs,
  whiteSpace: "nowrap" as const,
};

export const panelLeft = style({
  ...panelBase,
  right: "calc(100% + 0.5rem)",
});

export const panelRight = style({
  ...panelBase,
  left: "calc(100% + 0.5rem)",
  maxWidth: "calc(100vw - 5.5rem)",
  "@media": {
    "screen and (max-width: 600px)": {
      // When wrapper is full-width, fill from after the button all the way to the right edge.
      left: "4.5rem",
      right: 0,
      maxWidth: "none",
    },
  },
});

// Keep the old export as an alias for panelLeft for any stale references
export const panel = panelLeft;

export const urlInput = style({
  fontFamily: "var(--font-geist-mono)",
  padding: `${spacing.xs} ${spacing.sm}`,
  backgroundColor: colors.dark.surface,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  fontSize: "0.8rem",
  fontWeight: "600",
  // flex:1 so it expands to fill the panel when panel has an explicit width
  flex: 1,
  minWidth: "6rem",
  width: "13rem",
  transition: "border-color 0.15s ease",
  ":focus": {
    outline: "none",
    borderColor: colors.dark.accent,
  },
  "::placeholder": {
    color: colors.dark.textMuted,
  },
  "@media": {
    "screen and (max-width: 600px)": {
      minWidth: 0,
      width: "auto",
    },
  },
});

export const offsetInputWrapper = style({
  display: "flex",
  alignItems: "center",
  gap: spacing.xs,
  fontFamily: "var(--font-geist-mono)",
  padding: `${spacing.xs} ${spacing.sm}`,
  backgroundColor: colors.dark.fretboard,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: borderRadius.md,
  fontSize: "0.8rem",
  fontWeight: "700",
  width: "5.5rem",
  transition: "border-color 0.15s ease",
  ":focus-within": {
    borderColor: colors.dark.accent,
  },
});

export const offsetInput = style({
  flex: 1,
  minWidth: 0,
  background: "transparent",
  border: "none",
  outline: "none",
  color: "inherit",
  fontFamily: "inherit",
  fontSize: "inherit",
  fontWeight: "inherit",
  textAlign: "right",
  "::-webkit-outer-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },
  "::-webkit-inner-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },
});

export const ytVolumeWrapper = style({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  height: "2.5rem",
  marginLeft: spacing.xs,
});

export const ytVolumeButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "2.5rem",
  width: "2.5rem",
  padding: 0,
  backgroundColor: colors.dark.surface,
  color: colors.dark.text,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: "999px",
  position: "relative",
  zIndex: 90,
  cursor: "pointer",
  transition: "all 0.2s ease",
  flexShrink: 0,
  ":hover": {
    borderColor: colors.dark.accent,
  },
});

export const ytVolumeOverlay = style({
  position: "absolute",
  top: 0,
  right: 0,
  zIndex: 80,
  display: "flex",
  alignItems: "center",
  gap: spacing.sm,
  height: "2.5rem",
  padding: `0 calc(2.5rem + ${spacing.sm}) 0 ${spacing.sm}`,
  backgroundColor: colors.dark.surface,
  border: `2px solid ${colors.dark.border}`,
  borderRadius: "999px",
  boxSizing: "border-box",
  minWidth: "100%",
  width: "max-content",
  maxWidth: "min(18rem, calc(100vw - 1rem))",
});

export const ytVolumeSlider = style({
  flex: 1,
  minWidth: "5.5rem",
  width: "7rem",
  accentColor: colors.dark.accent,
  cursor: "pointer",
  margin: 0,
});

export const ytVolumeIcon = style({
  position: "relative",
  width: "1.25rem",
  height: "1.25rem",
  display: "inline-block",
  selectors: {
    "&::before": {
      content: '""',
      position: "absolute",
      left: "0.08rem",
      top: "0.18rem",
      width: "0.72rem",
      height: "0.9rem",
      backgroundColor: colors.dark.text,
      clipPath: "polygon(0 35%, 35% 35%, 60% 12%, 60% 88%, 35% 65%, 0 65%)",
    },
    "&::after": {
      content: '""',
      position: "absolute",
      left: "0.68rem",
      top: "0.18rem",
      width: "0.55rem",
      height: "0.9rem",
      backgroundImage: `radial-gradient(circle at 0 50%, transparent 36%, ${colors.dark.text} 38% 42%, transparent 44%), radial-gradient(circle at 0 50%, transparent 56%, ${colors.dark.text} 58% 62%, transparent 64%)`,
    },
  },
});
