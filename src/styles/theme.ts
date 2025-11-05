export const colors = {
  primary: {
    50: "#fef3c7",
    100: "#fde68a",
    500: "#f59e0b",
    900: "#92400e",
  },
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
  blue: {
    200: "#bfdbfe",
    300: "#93c5fd",
    500: "#3b82f6",
  },
  // Dark theme colors
  dark: {
    bg: "#0a0a0a",
    surface: "#1a1a1a",
    fretboard: "#2a2a2a",
    border: "#404040",
    text: "#e5e5e5",
    textMuted: "#a3a3a3",
    accent: "#60a5fa",
    accentHover: "#3b82f6",
  },
} as const;

export const spacing = {
  xs: "0.5rem",
  sm: "1rem",
  md: "1.5rem",
  lg: "2rem",
  xl: "3rem",
} as const;

export const borderRadius = {
  sm: "2px",
  md: "4px",
  lg: "8px",
  full: "9999px",
} as const;
