"use client";
import * as styles from "./SecondOverlay.css";
import OverlayRow from "./OverlayRow";

// --- Begin: Global bestKey/accidental logic (copied from FirstOverlay) ---
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

const SCALE_SEMITONES: Record<string, number[]> = {
  "Diatonic scale":  [0,2,4,5,7,9,11],
  "Harmonic minor":  [0,2,4,5,8,9,11],
  "Melodic minor":   [0,2,4,6,8,9,11],
  "Harmonic major":  [0,2,4,5,7,8,11],
  "Whole Tone":      [0,2,4,6,8,10],
  "Diminished":      [0,2,3,5,6,8,9,11],
  "Pentatonic":      [0,2,4,7,9],
  "Blues":           [0,2,3,4,7,9],
};

const flatToSharp: Record<string, string> = {
  Bb: "A#", Eb: "D#", Ab: "G#", Db: "C#", Gb: "F#", Cb: "B", Fb: "E",
};

function getScalePitchClasses(scaleFamily: string, bestKey: string): ReadonlySet<number> | null {
  const offsets = SCALE_SEMITONES[scaleFamily];
  if (!offsets) return null;
  const rawKey = flatToSharp[bestKey] ?? bestKey;
  const tonicIdx = notes.indexOf(rawKey);
  if (tonicIdx < 0) return null;
  return new Set(offsets.map(d => (tonicIdx + d) % 12));
}

interface SecondOverlayProps {
  isVisible: boolean;
  mousePosition: { x: number; y: number };
  snappedPosition: { x: number; y: number } | null;
  cellWidth?: number;
  cellHeight?: number;
  currentFret: { string: number; fret: number } | null;
  showDimmedNotes: boolean;
  tuning: string;
  bgVariant?: "A" | "B";
  zIndex?: number;
  showDegrees?: boolean;
  toggledCells?: Record<string, boolean>;
  onCellToggle?: (cellId: string) => void;
  overlayFretOffset?: number;
  fretMetrics?: {
    centerXByFret: Record<number, number>;
    widthByFret: Record<number, number>;
    octaveWidth: number;
  };
  transitionAxis?: "both" | "vertical";
  transitionNudgeYPx?: number;
  scaleFamily?: string;
}

export default function SecondOverlay({
  isVisible,
  mousePosition,
  snappedPosition,
  cellWidth: measuredCellWidth,
  cellHeight: measuredCellHeight,
  currentFret,
  showDimmedNotes,
  tuning,
  bgVariant = "B",
  zIndex,
  showDegrees = false,
  toggledCells = {},
  onCellToggle,
  overlayFretOffset = 0,
  fretMetrics,
  transitionAxis = "both",
  transitionNudgeYPx = 0,
  scaleFamily,
}: SecondOverlayProps) {
  const position = snappedPosition || mousePosition;

  const cellWidth = measuredCellWidth ?? 64;
  const cellHeight = measuredCellHeight ?? 48;

  // Configuration for each string's row
  // String indices: 0=high E (top), 5=low E (bottom)
  // startFret is offset from currentFret
  const rowConfigs = [
    { stringIndex: -1, startFret: -1, numFrets: 7, gridStyle: styles.topGrid }, // Buffer above top string (mirrors string 0 config)
    { stringIndex: 0, startFret: -1, numFrets: 7, gridStyle: styles.topGrid }, // Top string (high E): 7 columns
    {
      stringIndex: 1,
      startFret: -1,
      numFrets: 5,
      gridStyle: styles.singleRowGrid5,
    }, // B string: 1 fret right
    { stringIndex: 2, startFret: -4, numFrets: 7, gridStyle: styles.topGrid }, // G string: 1 fret left
    {
      stringIndex: 3,
      startFret: -4,
      numFrets: 5,
      gridStyle: styles.singleRowGrid5,
    }, // D string: 1 fret right
    { stringIndex: 4, startFret: -6, numFrets: 7, gridStyle: styles.topGrid }, // A string: 1 fret left
    {
      stringIndex: 5,
      startFret: -6,
      numFrets: 5,
      gridStyle: styles.singleRowGrid5,
    }, // Bottom string (low E): unchanged
    { stringIndex: 6, startFret: -6, numFrets: 5, gridStyle: styles.singleRowGrid5 }, // Buffer below bottom string (mirrors string 5 config)
  ];

  // Compute global bestKey/accidentalStyle/displayKey
  const centerNotes = getAllOverlayCenterNotes(rowConfigs, currentFret, tuning);
  const { bestKey, displayKey, accidentalStyle } = computeGlobalBestKey(centerNotes);
  const scalePitchClasses = scaleFamily ? getScalePitchClasses(scaleFamily, bestKey) : null;

  // Swap background color based on bgVariant
  const backgroundColor = bgVariant === "A"
    ? "var(--color-overlay-a)"
    : "var(--color-overlay-b)";

  return (
    <>
      {rowConfigs.map((config) => (
        <OverlayRow
          key={`second-overlay-string-${config.stringIndex}`}
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
          zIndex={zIndex}
          accidentalStyle={accidentalStyle as "sharp" | "flat"}
          displayKey={displayKey}
          backgroundColor={backgroundColor}
          showDegrees={showDegrees}
          toggledCells={toggledCells}
          onCellToggle={onCellToggle}
          overlayFretOffset={overlayFretOffset}
          fretMetrics={fretMetrics}
          transitionAxis={transitionAxis}
          transitionNudgeYPx={transitionNudgeYPx}
          scalePitchClasses={scalePitchClasses}
        />
      ))}
    </>
  );
}
