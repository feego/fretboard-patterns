export const NOTES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export const TUNING_CONFIGS: Record<
  string,
  { note: string; octave: number }[]
> = {
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

export function getNoteAtPosition(
  stringIndex: number,
  fretNumber: number,
  tuning: string,
): string {
  const stringTuning = TUNING_CONFIGS[tuning] || TUNING_CONFIGS.standard;
  const openString = stringTuning[stringIndex];
  const openNoteIndex = NOTES.indexOf(openString.note);

  let wrappedFret = fretNumber;
  while (wrappedFret < 1) wrappedFret += 24;
  while (wrappedFret > 24) wrappedFret -= 24;

  const noteIndex = (openNoteIndex + wrappedFret) % 12;
  return NOTES[noteIndex];
}

const NATURAL_PITCH_CLASSES: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

/** Pitch class (0–11) of a note name like "A#", "Bb", "E#" or "Cb"; null if unparseable. */
export function toPitchClass(name: string): number | null {
  const match = /^([A-Ga-g])([#b]*)$/.exec(name.trim());
  if (!match) return null;
  let pc = NATURAL_PITCH_CLASSES[match[1].toUpperCase()];
  for (const accidental of match[2]) pc += accidental === "#" ? 1 : -1;
  return ((pc % 12) + 12) % 12;
}

export const FLAT_NAMES: Record<string, string> = {
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab",
  "A#": "Bb",
};

/** Display label for a pitch class, e.g. 1 → "C#/Db", 0 → "C". */
export function pitchClassLabel(pc: number): string {
  const sharp = NOTES[((pc % 12) + 12) % 12];
  const flat = FLAT_NAMES[sharp];
  return flat ? `${sharp}/${flat}` : sharp;
}
