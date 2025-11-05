"use client";

interface OverlayRowProps {
  stringIndex: number;
  startFret: number;
  numFrets: number;
  currentFret: { string: number; fret: number } | null;
  showDimmedNotes: boolean;
  isVisible: boolean;
  position: { x: number; y: number };
  cellWidth: number;
  cellHeight: number;
  gridClassName: string;
  cellClassName: string;
  centerCellClassName: string;
  emptyCellClassName: string;
  highlightedNoteClassName: string;
  dimmedNoteClassName: string;
  overlayClassName: string;
  visibleClassName: string;
  hiddenClassName: string;
  tuning: string;
}

const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Tuning configurations
const tuningConfigs: Record<string, { note: string; octave: number }[]> = {
  standard: [
    { note: "E", octave: 4 }, // 1st string (high E) - index 0
    { note: "B", octave: 3 }, // 2nd string
    { note: "G", octave: 3 }, // 3rd string
    { note: "D", octave: 3 }, // 4th string
    { note: "A", octave: 2 }, // 5th string
    { note: "E", octave: 2 }, // 6th string (low E) - index 5
  ],
  allFourths: [
    { note: "F", octave: 4 }, // 1st string (high F) - index 0
    { note: "C", octave: 4 }, // 2nd string
    { note: "G", octave: 3 }, // 3rd string
    { note: "D", octave: 3 }, // 4th string
    { note: "A", octave: 2 }, // 5th string
    { note: "E", octave: 2 }, // 6th string (low E) - index 5
  ],
};

// Calculate the note at a specific string and fret
function getNoteAtPosition(
  stringIndex: number,
  fretNumber: number,
  tuning: string,
): string {
  const stringTuning = tuningConfigs[tuning] || tuningConfigs.standard;
  const openString = stringTuning[stringIndex];
  const openNoteIndex = notes.indexOf(openString.note);

  // Wrap fret number to stay within 1-24 range (no fret 0 on display)
  // Each fret represents one semitone higher than the previous
  let wrappedFret = fretNumber;
  while (wrappedFret < 1) wrappedFret += 24;
  while (wrappedFret > 24) wrappedFret -= 24;

  // Calculate note: open string + fret number
  // Fret 1 = open + 1 semitone, Fret 2 = open + 2 semitones, Fret 12 = open + 12 (octave)
  const noteIndex = (openNoteIndex + wrappedFret) % 12;
  return notes[noteIndex];
}

export default function OverlayRow({
  stringIndex,
  startFret,
  numFrets,
  currentFret,
  showDimmedNotes,
  isVisible,
  position,
  cellWidth,
  cellHeight,
  gridClassName,
  cellClassName,
  centerCellClassName,
  emptyCellClassName,
  highlightedNoteClassName,
  dimmedNoteClassName,
  overlayClassName,
  visibleClassName,
  hiddenClassName,
  tuning,
}: OverlayRowProps) {
  if (!currentFret) return null;

  // Global horizontal nudge for all overlays (in fret units)
  // Positive values move overlays to the right; negative to the left.
  // Start with +2 as requested to align the visual placement without
  // altering upstream positioning logic.
  const overlayShiftFrets = 2;
  // If all-fourths tuning is selected, move ONLY the top two strings (0=high E, 1=B)
  // one fret to the left. Other strings remain unchanged.
  const tuningShiftFrets =
    tuning === "allFourths" && (stringIndex === 0 || stringIndex === 1)
      ? -1
      : 0;
  const totalShiftFrets = overlayShiftFrets + tuningShiftFrets;

  // Calculate the cells for this row
  const cells: {
    note: string;
    visible: boolean;
    isCenter: boolean;
    fretNumber: number;
  }[] = [];

  for (let i = 0; i < numFrets; i++) {
    // startFret is offset from current position
    const fretNumber = currentFret.fret + startFret + totalShiftFrets + i;
    const isHighlighted = i % 2 === 0; // Highlight every other column (0, 2, 4, 6)

    if (stringIndex >= 0 && stringIndex < 6) {
      const note = getNoteAtPosition(stringIndex, fretNumber, tuning);
      cells.push({ note, visible: true, isCenter: isHighlighted, fretNumber });
    } else {
      cells.push({ note: "", visible: false, isCenter: false, fretNumber });
    }
  }

  // Calculate position: center the grid relative to the current fret.
  // Each cell is exactly one fret wide. Our incoming position.x is the CENTER
  // of the currently selected fret. The overlay element itself is centered via
  // CSS (translate(-50%, -50%)). Therefore, the 'left' value we set should be
  // the center of the entire grid for this row. If the first visible column
  // is at (currentFret + startFret), then the grid center is that fret plus
  // half the grid width minus half a cell: startFret + (numFrets - 1) / 2.
  const horizontalOffset =
    (startFret + totalShiftFrets + (numFrets - 1) / 2) * cellWidth;
  const verticalOffset = (stringIndex - currentFret.string) * cellHeight;

  return (
    <div
      className={`${overlayClassName} ${isVisible && cells.length > 0 ? visibleClassName : hiddenClassName}`}
      style={{
        left: position.x + horizontalOffset,
        top: position.y + verticalOffset,
      }}
    >
      <div className={gridClassName}>
        {cells.map((cell) => {
          const shouldShow = cell.isCenter || showDimmedNotes;
          return (
            <div
              key={`row-${stringIndex}-fret-${cell.fretNumber}`}
              className={`${cellClassName} ${cell.isCenter ? centerCellClassName : ""} ${!cell.visible ? emptyCellClassName : ""} ${cell.visible && shouldShow ? (cell.isCenter ? highlightedNoteClassName : dimmedNoteClassName) : emptyCellClassName}`}
            >
              {cell.visible && shouldShow ? cell.note : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
