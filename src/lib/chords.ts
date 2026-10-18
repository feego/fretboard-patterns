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
  | "maj7"
  | "7"
  | "m7"
  | "m7b5";

export interface Chord {
  root: number;
  quality: ChordQuality;
}

const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  maj7: [0, 4, 7, 11],
  "7": [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10],
};

export const CHORD_SUFFIXES: Record<ChordQuality, string> = {
  maj: "",
  min: "m",
  dim: "°",
  aug: "+",
  maj7: "maj7",
  "7": "7",
  m7: "m7",
  m7b5: "m7♭5",
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

const CHORD_SET_QUALITIES: Record<ChordSet, ChordQuality[]> = {
  majmin: ["maj", "min"],
  triads: ["maj", "min", "dim", "aug"],
  sevenths: ["maj7", "7", "m7", "m7b5"],
  all: ["maj", "min", "dim", "aug", "maj7", "7", "m7", "m7b5"],
};

export type ChordShape = "adjacent" | "full";

export const CHORD_SHAPE_LABELS: Record<ChordShape, string> = {
  adjacent: "Adjacent strings",
  full: "Full shapes",
};

// Qualities of the chords built on each degree of a major key.
const DIATONIC_TRIADS: ChordQuality[] = ["maj", "min", "min", "maj", "maj", "min", "dim"];
const DIATONIC_SEVENTHS: ChordQuality[] = ["maj7", "m7", "m7", "maj7", "7", "m7", "m7b5"];

export function chordQualities(set: ChordSet): ChordQuality[] {
  return CHORD_SET_QUALITIES[set];
}

export function chordPitchClasses(chord: Chord): number[] {
  return CHORD_INTERVALS[chord.quality].map((step) => (chord.root + step) % 12);
}

/** Same notes, so e.g. any root of a (symmetrical) augmented chord counts. */
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

/** The chords that can be asked: a key's diatonic chords, or every root. */
export function chordsInScope(set: ChordSet, key: number | null): Chord[] {
  const qualities = CHORD_SET_QUALITIES[set];
  if (key == null) {
    return qualities.flatMap((quality) =>
      NOTES.map((_, root) => ({ root, quality })),
    );
  }
  const degrees = keyPitchClasses(key);
  const chords: Chord[] = [];
  for (const diatonic of [DIATONIC_TRIADS, DIATONIC_SEVENTHS]) {
    degrees.forEach((root, degree) => {
      if (qualities.includes(diatonic[degree])) {
        chords.push({ root, quality: diatonic[degree] });
      }
    });
  }
  return chords;
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
