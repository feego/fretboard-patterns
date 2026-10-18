import {
  getNoteAtPosition,
  KEY_NAMES,
  keyPitchClasses,
  NOTES,
  noteNameInKey,
} from "./notes";

export type ChordQuality =
  | "maj"
  | "min"
  | "dim"
  | "aug"
  | "sus2"
  | "sus4"
  | "6"
  | "m6"
  | "add9"
  | "maj7"
  | "7"
  | "m7"
  | "m7b5"
  | "dim7"
  | "mMaj7"
  | "7sus4"
  | "9"
  | "maj9"
  | "m9"
  | "7b9"
  | "7#9"
  | "11"
  | "m11"
  | "13"
  | "maj13"
  | "m13";

export interface Chord {
  root: number;
  quality: ChordQuality;
}

/**
 * The notes each chord is played with, in semitones above the root. Extended
 * chords use the usual guitar voicings, which leave notes out so they fit on
 * four strings: no 5th in 9ths and 13ths, no 9th or 11th in 13ths, and 11ths
 * as root, 7th, 9th and 11th.
 */
const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  "6": [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  add9: [0, 4, 7, 2],
  maj7: [0, 4, 7, 11],
  "7": [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
  mMaj7: [0, 3, 7, 11],
  "7sus4": [0, 5, 7, 10],
  "9": [0, 4, 10, 2],
  maj9: [0, 4, 11, 2],
  m9: [0, 3, 10, 2],
  "7b9": [0, 4, 10, 1],
  "7#9": [0, 4, 10, 3],
  "11": [0, 10, 2, 5],
  m11: [0, 3, 10, 5],
  "13": [0, 4, 10, 9],
  maj13: [0, 4, 11, 9],
  m13: [0, 3, 10, 9],
};

/** Each note's role in the chord, matching CHORD_INTERVALS position by position. */
const CHORD_TONE_LABELS: Record<ChordQuality, string[]> = {
  maj: ["R", "3", "5"],
  min: ["R", "♭3", "5"],
  dim: ["R", "♭3", "♭5"],
  aug: ["R", "3", "♯5"],
  sus2: ["R", "2", "5"],
  sus4: ["R", "4", "5"],
  "6": ["R", "3", "5", "6"],
  m6: ["R", "♭3", "5", "6"],
  add9: ["R", "3", "5", "9"],
  maj7: ["R", "3", "5", "7"],
  "7": ["R", "3", "5", "♭7"],
  m7: ["R", "♭3", "5", "♭7"],
  m7b5: ["R", "♭3", "♭5", "♭7"],
  dim7: ["R", "♭3", "♭5", "♭♭7"],
  mMaj7: ["R", "♭3", "5", "7"],
  "7sus4": ["R", "4", "5", "♭7"],
  "9": ["R", "3", "♭7", "9"],
  maj9: ["R", "3", "7", "9"],
  m9: ["R", "♭3", "♭7", "9"],
  "7b9": ["R", "3", "♭7", "♭9"],
  "7#9": ["R", "3", "♭7", "♯9"],
  "11": ["R", "♭7", "9", "11"],
  m11: ["R", "♭3", "♭7", "11"],
  "13": ["R", "3", "♭7", "13"],
  maj13: ["R", "3", "7", "13"],
  m13: ["R", "♭3", "♭7", "13"],
};

/** A note's role in a chord (R, ♭3, 5, ♭9…), or null if it isn't a chord tone. */
export function chordToneLabel(chord: Chord, pc: number): string | null {
  const index = CHORD_INTERVALS[chord.quality].indexOf((pc - chord.root + 12) % 12);
  return index === -1 ? null : CHORD_TONE_LABELS[chord.quality][index];
}

export const CHORD_SUFFIXES: Record<ChordQuality, string> = {
  maj: "",
  min: "m",
  dim: "°",
  aug: "+",
  sus2: "sus2",
  sus4: "sus4",
  "6": "6",
  m6: "m6",
  add9: "add9",
  maj7: "maj7",
  "7": "7",
  m7: "m7",
  m7b5: "m7♭5",
  dim7: "°7",
  mMaj7: "mMaj7",
  "7sus4": "7sus4",
  "9": "9",
  maj9: "maj9",
  m9: "m9",
  "7b9": "7♭9",
  "7#9": "7♯9",
  "11": "11",
  m11: "m11",
  "13": "13",
  maj13: "maj13",
  m13: "m13",
};

/** Label for a quality on its own, e.g. for the quality picker. */
export const QUALITY_LABELS: Record<ChordQuality, string> = {
  ...CHORD_SUFFIXES,
  maj: "Maj",
};

export type ChordSet = "majmin" | "triads" | "sevenths" | "all";

export const CHORD_SET_LABELS: Record<ChordSet, string> = {
  majmin: "Major & minor",
  triads: "All triads",
  sevenths: "Sevenths",
  all: "Everything",
};

const TRIADS: ChordQuality[] = ["maj", "min", "dim", "aug"];
const SEVENTHS: ChordQuality[] = ["maj7", "7", "m7", "m7b5"];
// Everything else, roughly from simplest to most colourful.
const EXTENDED: ChordQuality[] = [
  "sus2",
  "sus4",
  "6",
  "m6",
  "add9",
  "7sus4",
  "dim7",
  "mMaj7",
  "9",
  "maj9",
  "m9",
  "7b9",
  "7#9",
  "11",
  "m11",
  "13",
  "maj13",
  "m13",
];

const CHORD_SET_QUALITIES: Record<ChordSet, ChordQuality[]> = {
  majmin: ["maj", "min"],
  triads: TRIADS,
  sevenths: SEVENTHS,
  all: [...TRIADS, ...SEVENTHS, ...EXTENDED],
};

export type ChordShape = "adjacent" | "full";

export const CHORD_SHAPE_LABELS: Record<ChordShape, string> = {
  adjacent: "Adjacent strings",
  full: "Full shapes",
};

/** Most answer buttons shown at once: two rows of seven. */
export const MAX_CHORD_CHOICES = 14;

export function chordQualities(set: ChordSet): ChordQuality[] {
  return CHORD_SET_QUALITIES[set];
}

export function chordPitchClasses(chord: Chord): number[] {
  return CHORD_INTERVALS[chord.quality].map((step) => (chord.root + step) % 12);
}

/**
 * Same notes, so equivalent spellings count: any root of a symmetrical chord
 * (augmented, diminished 7th), or e.g. C6 and Am7.
 */
export function sameChord(a: Chord, b: Chord): boolean {
  const pa = new Set(chordPitchClasses(a));
  const pb = chordPitchClasses(b);
  return pa.size === pb.length && pb.every((pc) => pa.has(pc));
}

/** Chord name, with the root spelled for the key (or conventionally without one). */
export function chordName(chord: Chord, key: number | null): string {
  const root = key == null ? KEY_NAMES[chord.root] : noteNameInKey(chord.root, key);
  return `${root}${CHORD_SUFFIXES[chord.quality]}`;
}

/**
 * The chords that can be asked: with a key, the chords on its degrees whose
 * notes are all in the key (triads, then sevenths, then the rest, each in
 * degree order); without one, every root.
 */
export function chordsInScope(set: ChordSet, key: number | null): Chord[] {
  const qualities = CHORD_SET_QUALITIES[set];
  if (key == null) {
    return qualities.flatMap((quality) =>
      NOTES.map((_, root) => ({ root, quality })),
    );
  }
  const scale = keyPitchClasses(key);
  const chords: Chord[] = [];
  for (const group of [TRIADS, SEVENTHS, EXTENDED]) {
    for (const root of scale) {
      for (const quality of group) {
        if (!qualities.includes(quality)) continue;
        const chord = { root, quality };
        if (chordPitchClasses(chord).every((pc) => scale.includes(pc))) {
          chords.push(chord);
        }
      }
    }
  }
  return chords;
}

/**
 * Whether answers are offered as a short multiple choice rather than every
 * chord in scope: when there are more than fit in two rows (or, without a key,
 * more qualities than the quality picker holds).
 */
export function usesChordChoices(set: ChordSet, key: number | null): boolean {
  return key == null
    ? CHORD_SET_QUALITIES[set].length > 4
    : chordsInScope(set, key).length > MAX_CHORD_CHOICES;
}

/**
 * Multiple-choice answers for a question: the asked chord plus look-alikes
 * (same root, or sharing notes), with a few random ones mixed in, in a stable
 * root-then-quality order (roots counted from the key's tonic, or from C).
 */
export function pickChordChoices(
  asked: Chord,
  candidates: Chord[],
  key: number | null,
): Chord[] {
  const askedPcs = chordPitchClasses(asked);
  const others = candidates.filter((c) => !sameChord(c, asked));
  const similarity = (c: Chord) =>
    chordPitchClasses(c).filter((pc) => askedPcs.includes(pc)).length +
    (c.root === asked.root ? 2 : 0) +
    Math.random() * 1.5;
  const ranked = others
    .map((c) => ({ c, score: similarity(c) }))
    .sort((a, b) => b.score - a.score)
    .map((r) => r.c);
  const lookAlikes = ranked.slice(0, 9);
  const rest = ranked.slice(9).sort(() => Math.random() - 0.5);
  const picked = [asked, ...lookAlikes, ...rest].slice(0, MAX_CHORD_CHOICES);
  const order = CHORD_SET_QUALITIES.all;
  const rootOrder = (c: Chord) => (c.root - (key ?? 0) + 12) % 12;
  return picked.sort(
    (a, b) =>
      rootOrder(a) - rootOrder(b) || order.indexOf(a.quality) - order.indexOf(b.quality),
  );
}

type Pos = { string: number; fret: number };

interface VoicingScope {
  /** One flag per string, index 0 = high string. */
  strings: boolean[];
  minFret: number;
  maxFret: number;
}

/** Frets a chord shape may span (one hand position). */
const SHAPE_SPAN_FRETS = 4;

/**
 * Every playable voicing of a chord within the scope, one note per string,
 * spanning at most four frets:
 * - "adjacent": as many neighbouring strings as the chord has notes, each
 *   note once (all inversions).
 * - "full": five or six strings down to the low string, root in the bass,
 *   every chord note present (barre-chord / CAGED-style grips).
 */
export function findVoicings(
  chord: Chord,
  shape: ChordShape,
  scope: VoicingScope,
  tuning: string,
): Pos[][] {
  const tones = chordPitchClasses(chord);
  const stringCount = scope.strings.length;

  const stringSets: number[][] = [];
  if (shape === "adjacent") {
    for (let start = 0; start + tones.length <= stringCount; start++) {
      stringSets.push(Array.from({ length: tones.length }, (_, i) => start + i));
    }
  } else {
    // Low string is the last index; full shapes run from it (or the next one) up.
    for (const size of [6, 5]) {
      if (size > stringCount || size < tones.length) continue;
      const bass = stringCount - 1 - (6 - size);
      stringSets.push(Array.from({ length: size }, (_, i) => bass - (size - 1) + i));
    }
  }

  const found = new Map<string, Pos[]>();
  const lastLo = Math.max(scope.minFret, scope.maxFret - SHAPE_SPAN_FRETS + 1);
  for (const strings of stringSets) {
    if (!strings.every((s) => scope.strings[s])) continue;
    for (let lo = scope.minFret; lo <= lastLo; lo++) {
      const hi = Math.min(lo + SHAPE_SPAN_FRETS - 1, scope.maxFret);
      const options = strings.map((s) => {
        const frets: { fret: number; pc: number }[] = [];
        for (let fret = lo; fret <= hi; fret++) {
          const pc = NOTES.indexOf(getNoteAtPosition(s, fret, tuning));
          if (tones.includes(pc)) frets.push({ fret, pc });
        }
        return frets;
      });
      if (options.some((o) => o.length === 0)) continue;

      const pick = (i: number, chosen: { fret: number; pc: number }[]) => {
        if (i === strings.length) {
          const pcs = chosen.map((c) => c.pc);
          const coversAll = tones.every((t) => pcs.includes(t));
          if (!coversAll) return;
          if (shape === "adjacent" && new Set(pcs).size !== pcs.length) return;
          if (shape === "full") {
            // Root in the bass (the bass is the last, lowest string).
            if (pcs[pcs.length - 1] !== chord.root) return;
            // Playable: a barre on the lowest fret plus at most three fingers.
            const barreFret = Math.min(...chosen.map((c) => c.fret));
            if (chosen.filter((c) => c.fret > barreFret).length > 3) return;
          }
          const voicing = strings.map((s, j) => ({ string: s, fret: chosen[j].fret }));
          found.set(voicing.map((p) => `${p.string}:${p.fret}`).join(","), voicing);
          return;
        }
        for (const option of options[i]) pick(i + 1, [...chosen, option]);
      };
      pick(0, []);
    }
  }
  return [...found.values()];
}
