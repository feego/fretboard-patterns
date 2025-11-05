"use client";

import * as styles from "./FirstOverlay.css";
import OverlayRow from "./OverlayRow";

// --- Begin: Global bestKey/accidental logic (copied from OverlayRow, refactored) ---
const flatMap: Record<string, string> = {
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab",
  "A#": "Bb",
};
const sharpKeys = new Set([
  "C", "G", "D", "A", "E", "B", "F#", "C#"
]);
const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const majorScales: Record<string, string[]> = {
  C:    ["C", "D", "E", "F", "G", "A", "B"],
  G:    ["G", "A", "B", "C", "D", "E", "F#"],
  D:    ["D", "E", "F#", "G", "A", "B", "C#"],
  A:    ["A", "B", "C#", "D", "E", "F#", "G#"],
  E:    ["E", "F#", "G#", "A", "B", "C#", "D#"],
  B:    ["B", "C#", "D#", "E", "F#", "G#", "A#"],
  "F#": ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
  "C#": ["C#", "D#", "E#", "F#", "G#", "A#", "B#"],
  F:    ["F", "G", "A", "Bb", "C", "D", "E"],
  Bb:   ["Bb", "C", "D", "Eb", "F", "G", "A"],
  Eb:   ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
  Ab:   ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
  Db:   ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
  Gb:   ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"],
  Cb:   ["Cb", "Db", "Eb", "Fb", "Gb", "Ab", "Bb"],
};
const enharmonicMap: Record<string, string[]> = {
  "E#": ["F"], "F": ["E#"],
  "B#": ["C"], "C": ["B#"],
  "Cb": ["B"], "B": ["Cb"],
  "Fb": ["E"], "E": ["Fb"],
};
const tuningConfigs: Record<string, { note: string; octave: number }[]> = {
  standard: [
    { note: "E", octave: 4 },
    { note: "B", octave: 3 },
    { note: "G", octave: 3 },
    { note: "D", octave: 3 },
    { note: "A", octave: 2 },
    { note: "E", octave: 2 },
  ],
  allFourths: [
    { note: "F", octave: 4 },
    { note: "C", octave: 4 },
    { note: "G", octave: 3 },
    { note: "D", octave: 3 },
    { note: "A", octave: 2 },
    { note: "E", octave: 2 },
  ],
};
function getNoteAtPosition(stringIndex: number, fretNumber: number, tuning: string): string {
  const stringTuning = tuningConfigs[tuning] || tuningConfigs.standard;
  const openString = stringTuning[stringIndex];
  const openNoteIndex = notes.indexOf(openString.note);
  let wrappedFret = fretNumber;
  while (wrappedFret < 1) wrappedFret += 24;
  while (wrappedFret > 24) wrappedFret -= 24;
  const noteIndex = (openNoteIndex + wrappedFret) % 12;
  return notes[noteIndex];
}

// Compute all center notes for all rows
function getAllOverlayCenterNotes(
  rowConfigs: { stringIndex: number; startFret: number; numFrets: number }[],
  currentFret: { string: number; fret: number } | null,
  tuning: string
): string[] {
  if (!currentFret) return [];
  const overlayShiftFrets = 2;
  return rowConfigs.flatMap((config) => {
    const tuningShiftFrets =
      tuning === "allFourths" && (config.stringIndex === 0 || config.stringIndex === 1)
        ? -1
        : 0;
    const totalShiftFrets = overlayShiftFrets + tuningShiftFrets;
    const notesArr: string[] = [];
    for (let i = 0; i < config.numFrets; i++) {
      const isHighlighted = i % 2 === 0;
      if (isHighlighted && config.stringIndex >= 0 && config.stringIndex < 6) {
        const fretNumber = currentFret.fret + config.startFret + totalShiftFrets + i;
        const note = getNoteAtPosition(config.stringIndex, fretNumber, tuning);
        notesArr.push(note);
      }
    }
    return notesArr;
  });
}

function computeGlobalBestKey(centerNotes: string[]) {
  let bestKey = "C";
  let bestCount = -1;
  let bestIsFlat = false;
  for (const [key, scale] of Object.entries(majorScales)) {
    let count = 0;
    for (const n of centerNotes) {
      if (scale.includes(n) || scale.includes(flatMap[n] || n)) {
        count++;
        continue;
      }
      if (enharmonicMap[n]) {
        for (const enh of enharmonicMap[n]) {
          if (scale.includes(enh)) {
            count++;
            break;
          }
        }
      }
    }
    if (count > bestCount) {
      bestKey = key;
      bestCount = count;
      bestIsFlat = !sharpKeys.has(key);
    }
  }
  // Always display Gb for F# and Db for C#
  let displayKey = bestKey;
  if (bestKey === "F#" || bestKey === "Gb") displayKey = "Gb";
  if (bestKey === "C#" || bestKey === "Db") displayKey = "Db";
  const accidentalStyle = bestIsFlat ? "flat" : "sharp";
  return { bestKey, displayKey, accidentalStyle };
}
// --- End: Global bestKey/accidental logic ---

interface FirstOverlayProps {
  isVisible: boolean;
  mousePosition: { x: number; y: number };
  snappedPosition: { x: number; y: number } | null;
  currentFret: { string: number; fret: number } | null;
  showDimmedNotes: boolean;
  tuning: string;
  bgVariant?: "A" | "B";
  zIndex?: number;
  showDegrees?: boolean;
  toggledCells?: Record<string, boolean>;
  onCellToggle?: (cellId: string) => void;
  overlayFretOffset?: number;
}

export default function FirstOverlay({
  isVisible,
  mousePosition,
  snappedPosition,
  currentFret,
  showDimmedNotes,
  tuning,
  bgVariant = "A",
  zIndex,
  showDegrees = false,
  toggledCells = {},
  onCellToggle,
  overlayFretOffset = 0,
}: FirstOverlayProps) {
  const position = snappedPosition || mousePosition;

  const rootFontSize = 16;
  const cellWidth = 4 * rootFontSize;
  const cellHeight = 3 * rootFontSize;

  // Configuration for each string's row
  // String indices: 0=high E (top), 5=low E (bottom)
  // startFret is offset from currentFret (e.g., -11 means 11 frets to the left)
  const rowConfigs = [
    { stringIndex: 0, startFret: -6, numFrets: 5, gridStyle: styles.thirdGrid }, // Top string (high E): shifted 1 right
    {
      stringIndex: 1,
      startFret: -8,
      numFrets: 7,
      gridStyle: styles.fourthGrid,
    }, // String 2: 7 columns
    { stringIndex: 2, startFret: -9, numFrets: 5, gridStyle: styles.thirdGrid }, // String 3 (G): shifted 1 fret right
    {
      stringIndex: 3,
      startFret: -11,
      numFrets: 7,
      gridStyle: styles.fourthGrid,
    }, // String 4: 7 columns
    {
      stringIndex: 4,
      startFret: -11,
      numFrets: 5,
      gridStyle: styles.thirdGrid,
    }, // String 5 (A): 5 columns, shifted 1 fret right
    {
      stringIndex: 5,
      startFret: -1,
      numFrets: 7,
      gridStyle: styles.fourthGrid,
    }, // Bottom string (low E): 7 columns
  ];

  // Compute global bestKey/accidentalStyle/displayKey
  const centerNotes = getAllOverlayCenterNotes(rowConfigs, currentFret, tuning);
  const { bestKey, displayKey, accidentalStyle } = computeGlobalBestKey(centerNotes);
  // console.log("FirstOverlay global bestKey:", bestKey, "displayKey:", displayKey);

  // Swap background color based on bgVariant
  const backgroundColor = bgVariant === "A"
    ? "rgba(55, 60, 60, 0.7)"
    : "rgba(80, 75, 75, 0.7)";

  return (
    <>
      {rowConfigs.map((config) => (
        <OverlayRow
          key={`first-overlay-string-${config.stringIndex}`}
          stringIndex={config.stringIndex}
          startFret={config.startFret}
          numFrets={config.numFrets}
          currentFret={currentFret}
          showDimmedNotes={showDimmedNotes}
          isVisible={isVisible}
          position={position}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          gridClassName={`${config.gridStyle}`}
          cellClassName={styles.gridCell}
          centerCellClassName={styles.centerCell}
          emptyCellClassName={styles.emptyCell}
          highlightedNoteClassName={styles.highlightedNote}
          dimmedNoteClassName={styles.dimmedNote}
          overlayClassName={styles.overlay}
          visibleClassName={styles.visible}
          hiddenClassName={styles.hidden}
          tuning={tuning}
          accidentalStyle={accidentalStyle as "sharp" | "flat"}
          displayKey={displayKey}
          backgroundColor={backgroundColor}
          showDegrees={showDegrees}
          toggledCells={toggledCells}
          onCellToggle={onCellToggle}
          overlayFretOffset={overlayFretOffset}
        />
      ))}
    </>
  );
}
