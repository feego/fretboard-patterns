/** Faint string lines (white in light mode, black in dark), themed in globals.css. */
export const stringLineColor = "var(--color-string-line)";

/**
 * A horizontal string line through the middle of an element, as a background
 * image. Fret cells and overlay rows both draw it so the string stays visible
 * above the overlay zones (and below their note names).
 */
export const stringLineImage = `linear-gradient(to bottom, transparent calc(50% - 1px), ${stringLineColor} calc(50% - 1px), ${stringLineColor} calc(50% + 1px), transparent calc(50% + 1px))`;
