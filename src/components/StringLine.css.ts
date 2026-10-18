import { style } from "@vanilla-extract/css";
import { stringLineColor } from "../styles/stringLine";

/**
 * The string line through an overlay cell. Drawn per cell (rather than per row
 * or fret) so it can fade out under the note name; z-index -1 keeps it above
 * the row's zone shade but below the cell's text.
 */
export const cellLine = style({
  "::before": {
    content: '""',
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: "2px",
    transform: "translateY(-50%)",
    backgroundColor: stringLineColor,
    pointerEvents: "none",
    zIndex: -1,
  },
});

const fadeUnderName =
  "linear-gradient(to right, black 0%, transparent 32%, transparent 68%, black 100%)";

/** A cell showing a note name: the line fades out under the name. */
export const cellLineFaded = style([
  cellLine,
  {
    "::before": {
      maskImage: fadeUnderName,
      WebkitMaskImage: fadeUnderName,
    },
  },
]);
