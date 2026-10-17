import { FIRST_OVERLAY_ROWS } from "../components/FirstOverlay";
import { SECOND_OVERLAY_ROWS } from "../components/SecondOverlay";

export type OverlayZone = "A" | "B";

/** Matches the global nudge OverlayRow applies to every row. */
const OVERLAY_SHIFT_FRETS = 2;

/**
 * Which overlay zone (background shade) covers a fretboard cell, mirroring
 * how Fretboard lays out its alternating First/Second overlays: copies repeat
 * every 12 frets, and the second overlay is drawn above the first.
 */
export function getOverlayZone(
  stringIndex: number,
  fret: number,
  currentFret: { string: number; fret: number },
  tuning: string,
  swapBg: boolean,
): OverlayZone | null {
  const tuningShiftFrets =
    tuning === "allFourths" && (stringIndex === 0 || stringIndex === 1) ? -1 : 0;
  const layers = [
    { rows: SECOND_OVERLAY_ROWS, zone: swapBg ? "A" : "B" },
    { rows: FIRST_OVERLAY_ROWS, zone: swapBg ? "B" : "A" },
  ] as const;

  for (const { rows, zone } of layers) {
    const row = rows.find((r) => r.stringIndex === stringIndex);
    if (!row) continue;
    const firstFret =
      currentFret.fret + row.startFret + OVERLAY_SHIFT_FRETS + tuningShiftFrets;
    const offset = (((fret - firstFret) % 12) + 12) % 12;
    if (offset < row.numFrets) return zone;
  }
  return null;
}
