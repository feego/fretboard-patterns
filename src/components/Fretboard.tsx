"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import FirstOverlay from "./FirstOverlay";
import * as styles from "./Fretboard.css";
import FretboardArrows, { type ArrowKey } from "./FretboardArrows";
import FretboardControls from "./FretboardControls";
import * as controlStyles from "./FretboardControls.css";
import SecondOverlay from "./SecondOverlay";
import StringLabels from "./StringLabels";

type ToggledCellMap = Record<string, boolean>;
type MarkerTone = "primary" | "dim";

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const TUNING_CONFIGS: Record<string, { note: string; octave: number }[]> = {
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

function getNoteAtPosition(
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

const FLAT_MAP: Record<string, string> = {
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab",
  "A#": "Bb",
};

const SHARP_KEYS = new Set(["C", "G", "D", "A", "E", "B", "F#", "C#"]);

const MAJOR_SCALES: Record<string, string[]> = {
  C: ["C", "D", "E", "F", "G", "A", "B"],
  G: ["G", "A", "B", "C", "D", "E", "F#"],
  D: ["D", "E", "F#", "G", "A", "B", "C#"],
  A: ["A", "B", "C#", "D", "E", "F#", "G#"],
  E: ["E", "F#", "G#", "A", "B", "C#", "D#"],
  B: ["B", "C#", "D#", "E", "F#", "G#", "A#"],
  "F#": ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
  "C#": ["C#", "D#", "E#", "F#", "G#", "A#", "B#"],
  F: ["F", "G", "A", "Bb", "C", "D", "E"],
  Bb: ["Bb", "C", "D", "Eb", "F", "G", "A"],
  Eb: ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
  Ab: ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
  Db: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
  Gb: ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"],
  Cb: ["Cb", "Db", "Eb", "Fb", "Gb", "Ab", "Bb"],
};

const ENHARMONIC_MAP: Record<string, string[]> = {
  "E#": ["F"],
  F: ["E#"],
  "B#": ["C"],
  C: ["B#"],
  Cb: ["B"],
  B: ["Cb"],
  Fb: ["E"],
  E: ["Fb"],
};

function computeGlobalDisplayKey(centerNotes: string[]) {
  let bestKey = "C";
  let bestCount = -1;
  let bestIsFlat = false;

  for (const [key, scale] of Object.entries(MAJOR_SCALES)) {
    let count = 0;
    for (const n of centerNotes) {
      if (scale.includes(n) || scale.includes(FLAT_MAP[n] || n)) {
        count++;
        continue;
      }
      if (ENHARMONIC_MAP[n]) {
        for (const enh of ENHARMONIC_MAP[n]) {
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
      bestIsFlat = !SHARP_KEYS.has(key);
    }
  }

  // Always display Gb for F# and Db for C# (matches overlays)
  let displayKey = bestKey;
  if (bestKey === "F#" || bestKey === "Gb") displayKey = "Gb";
  if (bestKey === "C#" || bestKey === "Db") displayKey = "Db";

  const accidentalStyle = bestIsFlat ? "flat" : "sharp";
  return { bestKey, displayKey, accidentalStyle };
}

function displayKeyToRawTonic(displayKey: string): string {
  switch (displayKey) {
    case "Db":
      return "C#";
    case "Eb":
      return "D#";
    case "Gb":
      return "F#";
    case "Ab":
      return "G#";
    case "Bb":
      return "A#";
    case "Cb":
      return "B";
    case "Fb":
      return "E";
    default:
      return displayKey;
  }
}

function normalizeBeatKeyToDisplayKey(keyText: string): string | null {
  const trimmed = keyText.trim();
  if (!trimmed) return null;

  const m = trimmed.match(/^([A-Ga-g])\s*([#b])?/);
  if (!m) return null;

  let key = m[1].toUpperCase() + (m[2] ?? "");

  // Keep consistent with overlay display conventions.
  if (key === "F#" || key === "Gb") key = "Gb";
  if (key === "C#" || key === "Db") key = "Db";

  return key;
}

function pickNearestContinuousFret(
  currentContinuousFret: number,
  targetWrappedFret: number,
): number {
  // Find the closest continuous fret that maps to `targetWrappedFret` under
  // the same wrapping logic used elsewhere: wrapped = ((continuous-1) % 24) + 1.
  const baseK = Math.round((currentContinuousFret - targetWrappedFret) / 24);
  let best = targetWrappedFret + baseK * 24;
  let bestDist = Math.abs(best - currentContinuousFret);

  for (const k of [baseK - 1, baseK + 1]) {
    const candidate = targetWrappedFret + k * 24;
    const dist = Math.abs(candidate - currentContinuousFret);
    if (dist < bestDist) {
      best = candidate;
      bestDist = dist;
    }
  }
  return best;
}

function noteTokenToRawNote(token: string): string | null {
  const trimmed = token.trim();
  if (!trimmed) return null;
  const m = trimmed.match(/^([A-Ga-g])\s*([#b])?$/);
  if (!m) return null;
  const note = m[1].toUpperCase() + (m[2] ?? "");

  // Convert flats / uncommon spellings into our raw sharp-based pitch classes.
  switch (note) {
    case "Db":
      return "C#";
    case "Eb":
      return "D#";
    case "Gb":
      return "F#";
    case "Ab":
      return "G#";
    case "Bb":
      return "A#";
    case "Cb":
      return "B";
    case "Fb":
      return "E";
    case "B#":
      return "C";
    case "E#":
      return "F";
    default:
      return note;
  }
}

type ParsedChordTones = {
  rootPitchClass: number;
  primaryPitchClasses: Set<number>;
  dimPitchClasses: Set<number>;
};

function parseChordToPitchClasses(chordText: string): ParsedChordTones | null {
  const raw = chordText.trim();
  if (!raw) return null;

  // Common "no chord" markers.
  if (/^(?:N\.?C\.?|NC)$/i.test(raw)) return null;
  if (raw === "-" || raw === "—") return null;

  const normalized = raw.replace(/\s+/g, "");
  const [base, slashBass] = normalized.split("/");
  if (!base) return null;

  const baseMatch = /^([A-G](?:#|b)?)(.*)$/.exec(base);
  if (!baseMatch) return null;
  const rootToken = baseMatch[1];
  const suffix = baseMatch[2] ?? "";

  const rootRaw = noteTokenToRawNote(rootToken);
  if (!rootRaw) return null;
  const rootIndex = NOTES.indexOf(rootRaw);
  if (rootIndex < 0) return null;

  const lower = suffix.toLowerCase();

  const has = (re: RegExp) => re.test(suffix);

  // Triad quality defaults.
  let third: number | null = 4; // major third
  let fifth: number | null = 7; // perfect fifth

  // Suspensions override the third.
  if (/(?:^|[^a-z])sus2(?:$|[^0-9])/.test(lower)) {
    third = 2;
  } else if (/(?:^|[^a-z])sus4(?:$|[^0-9])/.test(lower) || /sus(?!2|4)/.test(lower)) {
    third = 5;
  } else if (/^(?:m|min)(?!aj)/.test(lower) || /(?:^|[^a-z])m(?!aj)/.test(lower)) {
    third = 3;
  } else if (/dim|°/.test(lower)) {
    third = 3;
    fifth = 6;
  } else if (/aug|\+/.test(lower)) {
    fifth = 8;
  }

  // Explicit power chord: remove third.
  if (/(?:^|[^0-9])5(?:$|[^0-9])/.test(lower) && !/13|11|9|7|6|2|4/.test(lower)) {
    third = null;
  }

  // Base extensions.
  let seventh: number | null = null;
  const isDim = /dim|°/.test(lower);
  const hasMaj7 = /maj7|ma7|Δ7|Δ|\^7/i.test(suffix);
  const has7 = /7/.test(lower);
  const has6 = /(?:^|[^0-9])6(?:$|[^0-9])/.test(lower) || /69/.test(lower);
  if (hasMaj7) seventh = 11;
  else if (has7) seventh = isDim && /7/.test(lower) ? 9 : 10;

  // In common lead-sheet / jazz usage, a plain diminished chord symbol (e.g. "Bdim" or "B°")
  // typically implies a fully diminished 7th chord (1 b3 b5 bb7). Include bb7 by default.
  if (isDim && seventh == null && !has6) seventh = 9;

  const extensions = new Map<number, number>();
  const addExtension = (degree: 9 | 11 | 13, interval: number) => {
    extensions.set(degree, interval);
  };

  if (/add9/.test(lower) || /(?:^|[^0-9])9(?:$|[^0-9])/.test(lower)) addExtension(9, 14);
  if (/add11/.test(lower) || /(?:^|[^0-9])11(?:$|[^0-9])/.test(lower)) addExtension(11, 17);
  if (/add13/.test(lower) || /(?:^|[^0-9])13(?:$|[^0-9])/.test(lower)) addExtension(13, 21);

  // If 13 is present, imply 9 and 11 only if they were explicitly written as part of 13/11/9.
  // (We keep it simple: only include what's explicitly present or add*.)

  // Alterations (b/#) for 5/9/11/13.
  for (const match of suffix.matchAll(/([b#])(5|9|11|13)/g)) {
    const accidental = match[1];
    const degree = Number(match[2]) as 5 | 9 | 11 | 13;
    const delta = accidental === "b" ? -1 : 1;
    if (degree === 5 && fifth != null) {
      fifth = fifth + delta;
      continue;
    }
    if (degree === 9) addExtension(9, 14 + delta);
    if (degree === 11) addExtension(11, 17 + delta);
    if (degree === 13) addExtension(13, 21 + delta);
  }

  // Omissions.
  if (/omit3|no3/.test(lower)) third = null;
  if (/omit5|no5/.test(lower)) fifth = null;

  const primary = new Set<number>();
  const dim = new Set<number>();

  const addPrimaryInterval = (semitones: number) => {
    primary.add((rootIndex + ((semitones % 12) + 12) % 12) % 12);
  };

  // Root always primary.
  addPrimaryInterval(0);
  if (third != null) addPrimaryInterval(third);
  if (fifth != null) addPrimaryInterval(fifth);
  if (seventh != null) addPrimaryInterval(seventh);

  // 6 is typically a core tone for 6 chords.
  if (has6 && !/13/.test(lower)) addPrimaryInterval(9);

  // Treat extensions (9/11/13, add9, etc.) as chord tones (not dimmed).
  for (const interval of extensions.values()) addPrimaryInterval(interval);

  // Slash bass: select it, but keep it dim so it doesn't overpower the chord tones.
  if (slashBass) {
    const bassRaw = noteTokenToRawNote(slashBass);
    if (bassRaw) {
      const bassIndex = NOTES.indexOf(bassRaw);
      if (bassIndex >= 0) dim.add(bassIndex);
    }
  }

  // Ensure primary beats dim on overlap.
  for (const pc of primary) dim.delete(pc);

  return { rootPitchClass: rootIndex, primaryPitchClasses: primary, dimPitchClasses: dim };
}

function computeMajorTriadRawNotes(tonicRaw: string): Set<string> {
  const tonicIndex = NOTES.indexOf(tonicRaw);
  if (tonicIndex < 0) return new Set([tonicRaw]);

  const majorThird = NOTES[(tonicIndex + 4) % 12];
  const perfectFifth = NOTES[(tonicIndex + 7) % 12];
  return new Set([tonicRaw, majorThird, perfectFifth]);
}

const FRET_WIDTH_MAX_FACTOR = 1.15;
function getFretWidthFactor(fretNumber: number): number {
  // Make the left side (low fret numbers) slightly wider than the right.
  // Repeat the taper every 12 frets so octave-shifted overlays remain aligned.
  // 12th and 24th frets remain the base width (factor 1.0).
  const wrapped = ((Math.round(fretNumber) - 1) % 12 + 12) % 12 + 1;
  const t = (wrapped - 1) / 11; // 0 at fret 1, 1 at fret 12
  return FRET_WIDTH_MAX_FACTOR + (1 - FRET_WIDTH_MAX_FACTOR) * t;
}

function fretWidthCss(fretNumber: number): string {
  const factor = getFretWidthFactor(fretNumber);
  return `calc(var(--fret-width, 4rem) * ${factor.toFixed(4)})`;
}

type FretMetrics = {
  centerXByFret: Record<number, number>;
  widthByFret: Record<number, number>;
  octaveWidth: number;
};

function getFretCenterX(
  fretMetrics: FretMetrics | null,
  fretNumber: number,
): number | null {
  if (!fretMetrics) return null;

  // Geometry repeats in 12-fret (octave) cycles. Fold back into 1..24 and
  // apply octave offsets so motion stays continuous.
  let normalized = fretNumber;
  let octaveOffsetX = 0;
  while (normalized < 1) {
    normalized += 12;
    octaveOffsetX -= fretMetrics.octaveWidth;
  }
  while (normalized > 24) {
    normalized -= 12;
    octaveOffsetX += fretMetrics.octaveWidth;
  }

  const base = fretMetrics.centerXByFret[normalized];
  if (typeof base !== "number") return null;
  return base + octaveOffsetX;
}

export default function Fretboard() {
  // Track toggled overlay cells (keyed as "stringIndex:fretNumber")
  const [toggledCells, setToggledCells] = useState<Record<string, boolean>>({});
  const [selectedCellTones, setSelectedCellTones] = useState<
    Record<string, MarkerTone>
  >({});
  const toggledCellsRef = useRef(toggledCells);
  const selectedCellTonesRef = useRef(selectedCellTones);
  const prevTuningRef = useRef<string | null>(null);

  useEffect(() => {
    toggledCellsRef.current = toggledCells;
  }, [toggledCells]);

  useEffect(() => {
    selectedCellTonesRef.current = selectedCellTones;
  }, [selectedCellTones]);
  // When a cell is clicked, toggle its id (e.g. "4:12")
  const handleCellToggle = (cellId: string) => {
    setToggledCells((prev) => {
      const nextIsOn = !prev[cellId];
      const next = { ...prev, [cellId]: nextIsOn };
      if (!nextIsOn) delete next[cellId];
      return next;
    });
    setSelectedCellTones((prev) => {
      const next = { ...prev };
      if (toggledCells[cellId]) {
        // Turning off
        delete next[cellId];
      } else {
        // Turning on: manual selections default to primary.
        next[cellId] = "primary";
      }
      return next;
    });
  };
  // Tuning-aware string labels (top to bottom: high to low)
  // Standard: high E to low E; All Fourths: high F to low E
  const [tuning, setTuning] = useState("standard");
  const [hasMounted, setHasMounted] = useState(false);

  // On mount, sync tuning from localStorage (client only)
  useEffect(() => {
    setHasMounted(true);
    try {
      const stored = window.localStorage.getItem("fretboard-tuning");
      if (stored === "standard" || stored === "allFourths") setTuning(stored);
    } catch {}
  }, []);
  const strings =
    tuning === "allFourths"
      ? ["F", "C", "G", "D", "A", "E"]
      : ["E", "B", "G", "D", "A", "E"]; // Inverted order: high to low
  // Persist tuning to localStorage
  useEffect(() => {
    if (hasMounted) {
      try {
        window.localStorage.setItem("fretboard-tuning", tuning);
      } catch {}
    }
  }, [tuning, hasMounted]);

  // When switching between standard and all-fourths, the overlays shift the top
  // two strings (0 and 1) by one fret. Keep selected notes aligned by applying
  // the same shift to the selection state.
  useEffect(() => {
    if (!hasMounted) return;

    const prev = prevTuningRef.current;
    prevTuningRef.current = tuning;

    if (!prev || prev === tuning) return;

    const isPrevAllFourths = prev === "allFourths";
    const isNextAllFourths = tuning === "allFourths";

    // Standard -> All Fourths: overlays move left by 1 on top 2 strings => selection should also move left.
    // All Fourths -> Standard: move right by 1 on top 2 strings.
    const topStringFretDelta = !isPrevAllFourths && isNextAllFourths ? -1 : isPrevAllFourths && !isNextAllFourths ? 1 : 0;
    if (topStringFretDelta === 0) return;

    const prevToggled = toggledCellsRef.current;
    const prevTones = selectedCellTonesRef.current;

    const nextToggled: Record<string, boolean> = {};
    const nextTones: Record<string, MarkerTone> = {};

    const mergeTone = (a: MarkerTone | undefined, b: MarkerTone | undefined): MarkerTone | undefined => {
      if (a === "primary" || b === "primary") return "primary";
      if (a === "dim" || b === "dim") return "dim";
      return undefined;
    };

    for (const [cellId, isOn] of Object.entries(prevToggled)) {
      if (!isOn) continue;
      const [stringIndexRaw, fretNumberRaw] = cellId.split(":");
      const stringIndex = Number(stringIndexRaw);
      const fretNumber = Number(fretNumberRaw);
      if (!Number.isFinite(stringIndex) || !Number.isFinite(fretNumber)) continue;

      let nextFretNumber = fretNumber;
      if (stringIndex === 0 || stringIndex === 1) {
        nextFretNumber = fretNumber + topStringFretDelta;
      }

      if (nextFretNumber < 1 || nextFretNumber > 24) continue;
      const nextId = `${stringIndex}:${nextFretNumber}`;
      nextToggled[nextId] = true;

      const incomingTone = prevTones[cellId];
      const existingTone = nextTones[nextId];
      const merged = mergeTone(existingTone, incomingTone);
      if (merged) nextTones[nextId] = merged;
    }

    setToggledCells(nextToggled);
    setSelectedCellTones(nextTones);
  }, [tuning, hasMounted]);

  // Stable keys for string rows to avoid index-based keys and handle duplicate names in standard tuning
  const stringRowKeys =
    tuning === "allFourths"
      ? ["F", "C", "G", "D", "A", "E"]
      : ["E-top", "B", "G", "D", "A", "E-bottom"];
  const frets = 24;
  const markerFrets = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24]; // Extended marker frets

  const [basePosition, setBasePosition] = useState({ x: 0, y: 0 });
  const [isOverlayVisible, _setIsOverlayVisible] = useState(true); // Always visible
  const [currentFret, setCurrentFret] = useState<{
    string: number;
    fret: number;
  }>({ string: 4, fret: 12 }); // 2 strings down (string 4 = A)
  const [continuousFret, setContinuousFret] = useState(12); // Track continuous position for infinite scroll
  const [showDimmedNotes, setShowDimmedNotes] = useState(false);
  const [swapBg, setSwapBg] = useState(false);
  const [showDegrees, setShowDegrees] = useState(false);
  const [followChords, setFollowChords] = useState(true);
  const [showCagedNotes, setShowCagedNotes] = useState(false);

  // Metronome (header, top-right)
  const [bpm, setBpm] = useState(120);
  const [metronomeVolume, setMetronomeVolume] = useState(1);
  const [metronomeState, setMetronomeState] = useState<
    "stopped" | "running" | "paused"
  >("stopped");
  const [metronomeBeat, setMetronomeBeat] = useState<number | null>(null);
  const [activeBeatKeyText, setActiveBeatKeyText] = useState("");
  const [activeBeatChordText, setActiveBeatChordText] = useState("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalIdRef = useRef<number | null>(null);
  const uiTimeoutIdsRef = useRef<number[]>([]);
  const nextClickTimeRef = useRef(0);
  const beatIndexRef = useRef(0);
  const countInBeatsRemainingRef = useRef(0);
  const countInBeatIndexRef = useRef(0);
  const bpmRef = useRef(bpm);
  const metronomeVolumeRef = useRef(metronomeVolume);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    metronomeVolumeRef.current = metronomeVolume;
  }, [metronomeVolume]);

  const clearMetronomeTimers = useCallback(() => {
    if (intervalIdRef.current != null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    if (uiTimeoutIdsRef.current.length) {
      for (const id of uiTimeoutIdsRef.current) window.clearTimeout(id);
      uiTimeoutIdsRef.current = [];
    }

  }, []);

  const stopMetronome = useCallback(() => {
    clearMetronomeTimers();

    setMetronomeBeat(null);
    setMetronomeState("stopped");
    beatIndexRef.current = 0;
    nextClickTimeRef.current = 0;
    countInBeatsRemainingRef.current = 0;
    countInBeatIndexRef.current = 0;

    const ctx = audioContextRef.current;
    if (ctx && ctx.state === "running") {
      // Suspend so any recently scheduled clicks don't keep sounding.
      ctx.suspend().catch(() => {});
    }
  }, [clearMetronomeTimers]);

  const pauseMetronome = useCallback(() => {
    if (metronomeState !== "running") return;

    clearMetronomeTimers();
    setMetronomeState("paused");
    // Resume from the next beat after the last one we showed.
    // During count-in, the playhead is intentionally fixed, so don't advance it.
    if (countInBeatsRemainingRef.current > 0) {
      beatIndexRef.current = metronomeBeat ?? beatIndexRef.current;
    } else {
      beatIndexRef.current = (metronomeBeat ?? 0) + 1;
    }

    const ctx = audioContextRef.current;
    if (ctx && ctx.state === "running") {
      ctx.suspend().catch(() => {});
    }
  }, [clearMetronomeTimers, metronomeState, metronomeBeat]);

  const scheduleClick = useCallback(
    (ctx: AudioContext, time: number, isAccent: boolean) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const volume = Math.max(0, Math.min(1, metronomeVolumeRef.current ?? 1));
      const peak = 0.35 * volume;

      osc.type = "square";
      osc.frequency.value = isAccent ? 1200 : 900;

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.001);
      gain.gain.linearRampToValueAtTime(0, time + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.035);
    },
    [],
  );

  const startOrResumeMetronome = useCallback(async () => {
    if (metronomeState === "running") return;

    const AudioContextCtor =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextCtor) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor();
    }

    const ctx = audioContextRef.current;
    if (!ctx) return;

    try {
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
    } catch {
      return;
    }

    const LOOKAHEAD_MS = 25;
    const SCHEDULE_AHEAD_S = 0.12;

    // If starting from stopped, keep any user-armed playhead (via seek).
    // If no playhead is armed, stopMetronome() already reset beatIndexRef to 0.
    if (metronomeState === "stopped" && metronomeBeat == null) {
      setMetronomeBeat(null);
    }

    nextClickTimeRef.current = ctx.currentTime + 0.05;

    // Clear any stale UI timeouts from a previous run.
    if (uiTimeoutIdsRef.current.length) {
      for (const id of uiTimeoutIdsRef.current) window.clearTimeout(id);
      uiTimeoutIdsRef.current = [];
    }

    const scheduler = () => {
      const bpmNow = Math.max(30, Math.min(300, bpmRef.current || 120));
      const secondsPerBeat = 60 / bpmNow;
      while (nextClickTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_S) {
        const isCountIn = countInBeatsRemainingRef.current > 0;
        const playheadBeatNumber = beatIndexRef.current;
        const clickBeatNumber = isCountIn ? countInBeatIndexRef.current : playheadBeatNumber;

        const isAccent = clickBeatNumber % 4 === 0;
        scheduleClick(ctx, nextClickTimeRef.current, isAccent);

        // Keep the visual playhead in sync with the scheduled click.
        const fireAt = nextClickTimeRef.current;
        const delayMs = Math.max(0, (fireAt - ctx.currentTime) * 1000);
        const timeoutId = window.setTimeout(() => {
          // During count-in, keep the playhead fixed at the armed start beat.
          // (We still schedule clicks, but we don't advance the chord grid yet.)
          setMetronomeBeat(playheadBeatNumber);
        }, delayMs);
        uiTimeoutIdsRef.current.push(timeoutId);

        nextClickTimeRef.current += secondsPerBeat;

        if (isCountIn) {
          countInBeatsRemainingRef.current -= 1;
          countInBeatIndexRef.current += 1;
          continue;
        }

        beatIndexRef.current += 1;
      }
    };

    setMetronomeState("running");
    scheduler();
    intervalIdRef.current = window.setInterval(scheduler, LOOKAHEAD_MS);
  }, [metronomeState, metronomeBeat, scheduleClick]);

  const seekMetronomeToBeat = useCallback(
    (beatIndex: number) => {
      // Spec: don't auto-start playback.
      // While running, ignore seeks to avoid desync between scheduled audio and UI.
      if (metronomeState === "running") return;

      const nextBeat = Math.max(0, Math.floor(beatIndex));
      beatIndexRef.current = nextBeat;
      setMetronomeBeat(nextBeat);
    },
    [metronomeState],
  );

  const playPauseMetronome = useCallback(() => {
    if (metronomeState === "running") {
      pauseMetronome();
      return;
    }

    // Count-in only when starting from stopped (not on resume).
    if (metronomeState === "stopped") {
      const armed = metronomeBeat ?? 0;
      beatIndexRef.current = armed;
      setMetronomeBeat(armed);
      countInBeatsRemainingRef.current = 4;
      countInBeatIndexRef.current = 0;
    }

    startOrResumeMetronome();
  }, [metronomeState, metronomeBeat, pauseMetronome, startOrResumeMetronome]);

  useEffect(() => {
    return () => {
      clearMetronomeTimers();
    };
  }, [clearMetronomeTimers]);
  const fretboardRef = useRef<HTMLDivElement>(null);
  const fretboardWrapperRef = useRef<HTMLDivElement>(null);
  const [selectedMarkerPositions, setSelectedMarkerPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [cagedHighlightedCells, setCagedHighlightedCells] = useState<
    Record<string, boolean>
  >({});
  const [activeChordTones, setActiveChordTones] = useState<ParsedChordTones | null>(
    null,
  );
  const [chordSelectedCells, setChordSelectedCells] = useState<
    Record<string, boolean>
  >({});
  const [chordSelectedCellTones, setChordSelectedCellTones] = useState<
    Record<string, MarkerTone>
  >({});
  const [chordSelectedCellIsRoot, setChordSelectedCellIsRoot] = useState<
    Record<string, boolean>
  >({});
  const [chordMarkerPositions, setChordMarkerPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [fretMetrics, setFretMetrics] = useState<FretMetrics | null>(null);

  // When the chord editor reports an active beat key (e.g. while the metronome
  // runs), shift the overlay anchor so the overlay key matches.
  useEffect(() => {
    const desiredDisplayKey = normalizeBeatKeyToDisplayKey(activeBeatKeyText);
    if (!desiredDisplayKey) return;

    // Mirror the same row configs used by FirstOverlay/SecondOverlay.
    const firstOverlayRows = [
      { stringIndex: 0, startFret: -6, numFrets: 5 },
      { stringIndex: 1, startFret: -8, numFrets: 7 },
      { stringIndex: 2, startFret: -9, numFrets: 5 },
      { stringIndex: 3, startFret: -11, numFrets: 7 },
      { stringIndex: 4, startFret: -11, numFrets: 5 },
      { stringIndex: 5, startFret: -1, numFrets: 7 },
    ];
    const secondOverlayRows = [
      { stringIndex: 0, startFret: -1, numFrets: 7 },
      { stringIndex: 1, startFret: -1, numFrets: 5 },
      { stringIndex: 2, startFret: -4, numFrets: 7 },
      { stringIndex: 3, startFret: -4, numFrets: 5 },
      { stringIndex: 4, startFret: -6, numFrets: 7 },
      { stringIndex: 5, startFret: -6, numFrets: 5 },
    ];

    const overlayShiftFrets = 2;

    const computeOverlayDisplayKeyForCenterFret = (centerFret: number) => {
      const centerNotes: string[] = [];
      const collectCenterNotes = (
        rows: { stringIndex: number; startFret: number; numFrets: number }[],
      ) => {
        for (const row of rows) {
          const tuningShiftFrets =
            tuning === "allFourths" &&
            (row.stringIndex === 0 || row.stringIndex === 1)
              ? -1
              : 0;
          const totalShiftFrets = overlayShiftFrets + tuningShiftFrets;
          for (let i = 0; i < row.numFrets; i++) {
            if (i % 2 !== 0) continue;
            const fretNumber = centerFret + row.startFret + totalShiftFrets + i;
            const note = getNoteAtPosition(row.stringIndex, fretNumber, tuning);
            centerNotes.push(note);
          }
        }
      };
      collectCenterNotes(firstOverlayRows);
      collectCenterNotes(secondOverlayRows);
      return computeGlobalDisplayKey(centerNotes).displayKey;
    };

    const currentWrappedFret = currentFret.fret;

    // Find the nearest center fret (1..24) whose overlay-computed key matches.
    let bestFret: number | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let candidateFret = 1; candidateFret <= 24; candidateFret++) {
      if (computeOverlayDisplayKeyForCenterFret(candidateFret) !== desiredDisplayKey)
        continue;

      const rawDist = Math.abs(candidateFret - currentWrappedFret);
      const wrapDist = 24 - rawDist;
      const dist = Math.min(rawDist, wrapDist);
      if (dist < bestDist) {
        bestDist = dist;
        bestFret = candidateFret;
      }
    }

    if (bestFret == null) return;
    if (bestFret === currentFret.fret) return;

    const nextContinuous = pickNearestContinuousFret(continuousFret, bestFret);
    setContinuousFret(nextContinuous);
    setCurrentFret((prev) => ({ ...prev, fret: bestFret }));
  }, [activeBeatKeyText, tuning, currentFret.fret, continuousFret]);

  // Keep the last valid chord tones until a new chord appears.
  // (Blank/NC/invalid beats should not clear selection.)
  useEffect(() => {
    if (!followChords) return;
    const parsed = parseChordToPitchClasses(activeBeatChordText);
    if (!parsed) return;
    setActiveChordTones(parsed);
  }, [activeBeatChordText, followChords]);

  useEffect(() => {
    if (followChords) return;
    setActiveChordTones(null);
    setChordSelectedCells({});
    setChordSelectedCellTones({});
    setChordSelectedCellIsRoot({});
    setChordMarkerPositions({});
  }, [followChords]);

  // Auto-select chord tones (separate from manual selections).
  // Recomputes when tuning changes, using the last valid chord tones.
  useEffect(() => {
    if (!followChords) {
      setChordSelectedCells({});
      setChordSelectedCellTones({});
      setChordSelectedCellIsRoot({});
      return;
    }
    if (!activeChordTones) return;

    const nextCells: Record<string, boolean> = {};
    const nextTones: Record<string, MarkerTone> = {};
    const nextIsRoot: Record<string, boolean> = {};

    for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
      for (let fretNumber = 1; fretNumber <= 24; fretNumber++) {
        const note = getNoteAtPosition(stringIndex, fretNumber, tuning);
        const pc = NOTES.indexOf(note);
        if (pc < 0) continue;
        if (
          !activeChordTones.primaryPitchClasses.has(pc) &&
          !activeChordTones.dimPitchClasses.has(pc)
        )
          continue;

        const id = `${stringIndex}:${fretNumber}`;
        nextCells[id] = true;
        nextTones[id] = activeChordTones.dimPitchClasses.has(pc)
          ? "dim"
          : "primary";
        nextIsRoot[id] = pc === activeChordTones.rootPitchClass;
      }
    }

    setChordSelectedCells(nextCells);
    setChordSelectedCellTones(nextTones);
    setChordSelectedCellIsRoot(nextIsRoot);
  }, [followChords, activeChordTones, tuning]);

  const clearSelectedNotes = useCallback(() => {
    setToggledCells({});
    setSelectedCellTones({});

    // Also clear chord-driven highlights.
    setChordSelectedCells({});
    setChordSelectedCellTones({});
    setChordSelectedCellIsRoot({});
    setChordMarkerPositions({});
    setActiveChordTones(null);
  }, []);

  // Compute highlighted CAGED cells for the current overlay anchor.
  useEffect(() => {
    if (!showCagedNotes || !currentFret) {
      setCagedHighlightedCells({});
      return;
    }

    // Mirror the same row configs used by FirstOverlay/SecondOverlay.
    const firstOverlayRows = [
      { stringIndex: 0, startFret: -6, numFrets: 5 },
      { stringIndex: 1, startFret: -8, numFrets: 7 },
      { stringIndex: 2, startFret: -9, numFrets: 5 },
      { stringIndex: 3, startFret: -11, numFrets: 7 },
      { stringIndex: 4, startFret: -11, numFrets: 5 },
      { stringIndex: 5, startFret: -1, numFrets: 7 },
    ];
    const secondOverlayRows = [
      { stringIndex: 0, startFret: -1, numFrets: 7 },
      { stringIndex: 1, startFret: -1, numFrets: 5 },
      { stringIndex: 2, startFret: -4, numFrets: 7 },
      { stringIndex: 3, startFret: -4, numFrets: 5 },
      { stringIndex: 4, startFret: -6, numFrets: 7 },
      { stringIndex: 5, startFret: -6, numFrets: 5 },
    ];

    const overlayShiftFrets = 2;
    const octaveCycleOffsets = Array.from({ length: 11 }, (_, i) => i - 5); // -5..+5

    // Infer the current tonic (degree 1) using the same "best key" heuristic.
    const centerNotes: string[] = [];
    const collectCenterNotes = (
      rows: { stringIndex: number; startFret: number; numFrets: number }[],
    ) => {
      for (const row of rows) {
        const tuningShiftFrets =
          tuning === "allFourths" && (row.stringIndex === 0 || row.stringIndex === 1)
            ? -1
            : 0;
        const totalShiftFrets = overlayShiftFrets + tuningShiftFrets;
        for (let i = 0; i < row.numFrets; i++) {
          if (i % 2 !== 0) continue;
          const fretNumber = currentFret.fret + row.startFret + totalShiftFrets + i;
          centerNotes.push(getNoteAtPosition(row.stringIndex, fretNumber, tuning));
        }
      }
    };
    collectCenterNotes(firstOverlayRows);
    collectCenterNotes(secondOverlayRows);

    const { displayKey } = computeGlobalDisplayKey(centerNotes);
    const tonicRaw = displayKeyToRawTonic(displayKey);
    const primaryRawNotes = computeMajorTriadRawNotes(tonicRaw); // degrees 1/3/5

    const next: Record<string, boolean> = {};
    const addOverlayHighlights = (
      rows: { stringIndex: number; startFret: number; numFrets: number }[],
    ) => {
      for (const row of rows) {
        const tuningShiftFrets =
          tuning === "allFourths" &&
          (row.stringIndex === 0 || row.stringIndex === 1)
            ? -1
            : 0;
        const totalShiftFrets = overlayShiftFrets + tuningShiftFrets;

        for (let i = 0; i < row.numFrets; i++) {
          // Match the overlay's always-visible columns, but only highlight 1/3/5.
          if (i % 2 !== 0) continue;
          const baseFret = currentFret.fret + row.startFret + totalShiftFrets + i;

          for (const cycleOffset of octaveCycleOffsets) {
            const fretNumber = baseFret + cycleOffset * 12;
            if (fretNumber < 1 || fretNumber > 24) continue;

            const rawNote = getNoteAtPosition(row.stringIndex, fretNumber, tuning);
            if (!primaryRawNotes.has(rawNote)) continue;

            const cellId = `${row.stringIndex}:${fretNumber}`;
            next[cellId] = true;
          }
        }
      }
    };

    addOverlayHighlights(firstOverlayRows);
    addOverlayHighlights(secondOverlayRows);

    setCagedHighlightedCells(next);
  }, [showCagedNotes, currentFret, tuning]);
  const [cellWidth, setCellWidth] = useState(64);
  const [cellHeight, setCellHeight] = useState(48);
  const [fretboardScale, setFretboardScale] = useState(1);
  const [scaledWrapperHeightPx, setScaledWrapperHeightPx] = useState<
    number | null
  >(null);

  // Position chord-selection markers using measured geometry (avoids per-beat DOM queries).
  useEffect(() => {
    if (!hasMounted || !fretMetrics) {
      setChordMarkerPositions({});
      return;
    }

    // If basePosition isn't ready yet, skip.
    if (!Number.isFinite(basePosition.y) || cellHeight <= 0) {
      setChordMarkerPositions({});
      return;
    }

    const next: Record<string, { x: number; y: number }> = {};
    for (const [cellId, isOn] of Object.entries(chordSelectedCells)) {
      if (!isOn) continue;
      const [stringIndexRaw, fretNumberRaw] = cellId.split(":");
      const stringIndex = Number(stringIndexRaw);
      const fretNumber = Number(fretNumberRaw);
      if (!Number.isFinite(stringIndex) || !Number.isFinite(fretNumber)) continue;

      const x = getFretCenterX(fretMetrics, fretNumber);
      if (x == null) continue;
      const y = basePosition.y + (stringIndex - 4) * cellHeight;
      next[cellId] = { x, y };
    }

    setChordMarkerPositions(next);
  }, [
    hasMounted,
    fretMetrics,
    chordSelectedCells,
    basePosition.y,
    cellHeight,
  ]);

  const measureBaseFromDom = () => {
    if (!fretboardRef.current) return;
    const fretElement = fretboardRef.current.querySelector(
      '[data-string="4"][data-fret-number="12"]',
    ) as HTMLElement | null;
    if (!fretElement) return;

    const fretRect = fretElement.getBoundingClientRect();
    const fretboardRect = fretboardRef.current.getBoundingClientRect();

    const scale = fretboardScale || 1;

    setCellWidth((fretRect.width || 64) / scale);
    setCellHeight((fretRect.height || 48) / scale);
    setBasePosition({
      x: (fretRect.left - fretboardRect.left + fretRect.width / 2) / scale,
      y: (fretRect.top - fretboardRect.top + fretRect.height / 2) / scale,
    });
  };

  // Compute a scale so the fretboard wrapper fits viewport width (important for iPhone landscape).
  useEffect(() => {
    const computeScale = () => {
      const wrapper = fretboardWrapperRef.current;
      if (!wrapper) return;

      // scrollWidth is not affected by CSS transforms; it's ideal for computing scale.
      const contentWidth = wrapper.scrollWidth;
      if (!contentWidth) return;

      const viewportWidth = Math.min(
        window.innerWidth,
        document.documentElement.clientWidth,
      );

      // Below this breakpoint, keep the fretboard at full size and allow horizontal scrolling
      // instead of shrinking the entire board.
      if (viewportWidth < 1280) {
        setFretboardScale(1);
        setScaledWrapperHeightPx(null);
        return;
      }

      // Small gutter so borders/shadows don't clip.
      const availableWidth = Math.max(0, viewportWidth - 16);
      const nextScale = Math.min(1, availableWidth / contentWidth);

      setFretboardScale(Number.isFinite(nextScale) ? nextScale : 1);

      const contentHeight = wrapper.scrollHeight;
      if (contentHeight) {
        setScaledWrapperHeightPx(contentHeight * nextScale);
      }
    };

    // Initial + on resize/orientation
    const timer = window.setTimeout(computeScale, 100);
    window.addEventListener("resize", computeScale);
    window.addEventListener("orientationchange", computeScale);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", computeScale);
      window.removeEventListener("orientationchange", computeScale);
    };
  }, []);

  // After mount (DOM exists) and after scale changes, re-measure base/cell size so overlays stay aligned.
  useLayoutEffect(() => {
    if (!hasMounted) return;
    // Allow the transform to apply before measuring.
    const raf = window.requestAnimationFrame(() => {
      measureBaseFromDom();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [hasMounted, fretboardScale]);

  // Keep selection markers positioned above overlays.
  useLayoutEffect(() => {
    if (!hasMounted) return;
    const fretboardEl = fretboardRef.current;
    if (!fretboardEl) return;

    const raf = window.requestAnimationFrame(() => {
      const next: Record<string, { x: number; y: number }> = {};
      const fretboardRect = fretboardEl.getBoundingClientRect();
      const scale = fretboardScale || 1;

      for (const [cellId, isOn] of Object.entries(toggledCells)) {
        if (!isOn) continue;
        const [stringIndexRaw, fretNumberRaw] = cellId.split(":");
        const stringIndex = Number(stringIndexRaw);
        const fretNumber = Number(fretNumberRaw);
        if (!Number.isFinite(stringIndex) || !Number.isFinite(fretNumber)) continue;

        const cellEl = fretboardEl.querySelector(
          `[data-string="${stringIndex}"][data-fret-number="${fretNumber}"]`,
        ) as HTMLElement | null;
        if (!cellEl) continue;

        const cellRect = cellEl.getBoundingClientRect();
        next[cellId] = {
          x: (cellRect.left - fretboardRect.left + cellRect.width / 2) / scale,
          y: (cellRect.top - fretboardRect.top + cellRect.height / 2) / scale,
        };
      }

      setSelectedMarkerPositions(next);
    });

    return () => window.cancelAnimationFrame(raf);
  }, [hasMounted, toggledCells, fretboardScale, tuning]);

  // Measure per-fret widths/centers (needed when frets are not uniform width).
  useLayoutEffect(() => {
    if (!hasMounted) return;
    const fretboardEl = fretboardRef.current;
    if (!fretboardEl) return;

    const raf = window.requestAnimationFrame(() => {
      const fretboardRect = fretboardEl.getBoundingClientRect();
      const scale = fretboardScale || 1;

      const centerXByFret: Record<number, number> = {};
      const widthByFret: Record<number, number> = {};

      for (let fretNumber = 1; fretNumber <= 24; fretNumber++) {
        const cellEl = fretboardEl.querySelector(
          `[data-string="0"][data-fret-number="${fretNumber}"]`,
        ) as HTMLElement | null;
        if (!cellEl) continue;
        const rect = cellEl.getBoundingClientRect();
        widthByFret[fretNumber] = (rect.width || 0) / scale;
        centerXByFret[fretNumber] =
          (rect.left - fretboardRect.left + rect.width / 2) / scale;
      }

      // 12-fret octave width, used for placing octave-shifted overlay copies.
      const d1 =
        centerXByFret[13] != null && centerXByFret[1] != null
          ? centerXByFret[13] - centerXByFret[1]
          : null;
      const octaveWidth = typeof d1 === "number" ? d1 : cellWidth * 12;

      setFretMetrics({ centerXByFret, widthByFret, octaveWidth });
    });

    return () => window.cancelAnimationFrame(raf);
  }, [hasMounted, fretboardScale, cellWidth]);

  // Handle arrow key navigation with infinite scroll
  const navigate = useCallback(
    (key: ArrowKey) => {
      if (!currentFret) return;

      let nextContinuousFret = continuousFret;
      let desiredStringDelta = 0;
      let fretDelta = 0;

      switch (key) {
        case "ArrowUp":
          // Move diagonally: up one string and forward 5 frets (keeps overlays moving).
          nextContinuousFret = continuousFret + 5;
          desiredStringDelta = -1;
          setSwapBg((s) => !s);
          break;
        case "ArrowDown":
          // Move diagonally: down one string and back 5 frets (keeps overlays moving).
          nextContinuousFret = continuousFret - 5;
          desiredStringDelta = 1;
          setSwapBg((s) => !s);
          break;
        case "ArrowLeft":
          nextContinuousFret = continuousFret - 1;
          fretDelta = -1;
          break;
        case "ArrowRight":
          nextContinuousFret = continuousFret + 1;
          fretDelta = 1;
          break;
      }

      const nextString = Math.min(
        5,
        Math.max(0, currentFret.string + desiredStringDelta),
      );
      const actualStringDelta = nextString - currentFret.string;

      // Calculate wrapped fret (1-24) from continuous fret
      let wrappedFret = ((nextContinuousFret - 1) % 24) + 1;
      if (wrappedFret <= 0) wrappedFret += 24;

      // Move toggled cells by the same navigation deltas.
      // Up/Down move strings; Left/Right move frets.
      if (actualStringDelta !== 0 || fretDelta !== 0) {
        const moved: Record<string, boolean> = {};
        const movedTones: Record<string, MarkerTone> = {};

        for (const [cellId, isOn] of Object.entries(toggledCells)) {
          if (!isOn) continue;
          const [strIdx, fretNum] = cellId.split(":").map(Number);
          const newStrIdx = strIdx + actualStringDelta;
          let newFretNum = fretNum + fretDelta;
          if (newFretNum < 1) newFretNum = 24;
          if (newFretNum > 24) newFretNum = 1;
          if (newStrIdx < 0 || newStrIdx > 5) continue;

          const nextId = `${newStrIdx}:${newFretNum}`;
          moved[nextId] = true;
          movedTones[nextId] = selectedCellTones[cellId] ?? "primary";
        }

        setToggledCells(moved);
        setSelectedCellTones(movedTones);
      }

      if (
        nextString !== currentFret.string ||
        nextContinuousFret !== continuousFret
      ) {
        setContinuousFret(nextContinuousFret);
        setCurrentFret({ string: nextString, fret: wrappedFret });

        // Update base position for string changes only
        if (actualStringDelta !== 0 && fretboardRef.current) {
          const fretElement = fretboardRef.current.querySelector(
            `[data-string="${nextString}"][data-fret-number="${wrappedFret}"]`,
          ) as HTMLElement | null;
          if (fretElement) {
            const fretRect = fretElement.getBoundingClientRect();
            const fretboardRect = fretboardRef.current.getBoundingClientRect();
            setBasePosition({
              x: basePosition.x, // Keep x the same
              y:
                (fretRect.top - fretboardRect.top + fretRect.height / 2) /
                (fretboardScale || 1),
            });
          }
        }
      }
    },
    [
      currentFret,
      continuousFret,
      basePosition.x,
      fretboardScale,
      toggledCells,
      selectedCellTones,
    ],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        const isFormField =
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          (target as any).isContentEditable;
        const inChordsEditor =
          typeof target.closest === "function" &&
          target.closest('[data-chords-editor="true"]');

        if (isFormField || inChordsEditor) return;
      }

      // Spacebar toggles play/pause.
      if (
        (e.key === " " || e.key === "Spacebar" || e.code === "Space") &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        playPauseMetronome();
        return;
      }

      if (
        e.key !== "ArrowUp" &&
        e.key !== "ArrowDown" &&
        e.key !== "ArrowLeft" &&
        e.key !== "ArrowRight"
      ) {
        return;
      }

      // Reserve modified arrows (e.g. Cmd+Arrow) for other shortcuts.
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      e.preventDefault();
      navigate(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, playPauseMetronome]);
  // Calculate current position with modulo to keep overlays cycling
  // Use modulo 24 frets (2 full cycles of 12) to keep overlays within range
  let effectiveFret = (continuousFret - 12) % 24;
  // Handle negative modulo correctly
  if (effectiveFret < 0) effectiveFret += 24;
  const fallbackX = basePosition.x + effectiveFret * cellWidth;

  // Anchor the overlay base X to the infinite-scroll fret value.
  const measuredCenterX = currentFret
    ? getFretCenterX(fretMetrics, currentFret.fret)
    : null;
  const currentPosition = {
    x: measuredCenterX ?? fallbackX,
    y: basePosition.y,
  };

  // Prevent hydration mismatch: only render after mount
  if (!hasMounted) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Fretboard Visualizer</h1>

        <div className={styles.headerTuning}>
          <label className={styles.headerTuningLabel} htmlFor="tuning-select">
            Tuning:
          </label>
          <select
            id="tuning-select"
            className={styles.headerTuningSelect}
            value={tuning}
            onChange={(e) => setTuning(e.target.value)}
          >
            <option value="standard">Standard</option>
            <option value="allFourths">All Fourths</option>
          </select>
        </div>
      </div>
      <div
        className={styles.fretboardScrollContainer}
        style={
          fretboardScale < 1 && scaledWrapperHeightPx
            ? { height: `${scaledWrapperHeightPx}px` }
            : undefined
        }
      >
        <div
          className={styles.fretboardWrapper}
          ref={fretboardWrapperRef}
          style={{
            transform: `scale(${fretboardScale})`,
            transformOrigin: "top left",
          }}
        >
        {/* Fret numbers above the fretboard */}
        <div
          style={{
            marginLeft: "0rem",
            marginBottom: "0.5rem",
            display: "flex",
          }}
        >
          <div style={{ width: "var(--label-width, 2rem)" }}></div>
          <div className={styles.stringRow}>
            {[...Array(frets)].map((_, fretIndex) => {
              const fretNumber = fretIndex + 1;
              return (
                <div
                  key={`fret-number-${fretNumber}`}
                  className={styles.fret}
                  style={{
                    width: fretWidthCss(fretNumber),
                    height: "auto",
                    padding: "0.25rem 0",
                    border: "none",
                    backgroundColor: "transparent",
                    fontSize: "0.7rem",
                    color: "#a3a3a3",
                    fontWeight: "600",
                  }}
                >
                  {fretNumber}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.fretboardRow}>
          <StringLabels strings={strings} stringKeys={stringRowKeys} />
          <div className={styles.fretboard} ref={fretboardRef}>
            {strings.map((_string, stringIndex) => (
              <div
                key={stringRowKeys[stringIndex]}
                className={styles.stringRow}
              >
                {[...Array(frets)].map((_, fretIndex) => {
                  const fretNumber = fretIndex + 1;
                  const isMarkerFret = markerFrets.includes(fretNumber);
                  const isDoubleMarker = fretNumber === 12 || fretNumber === 24;
                  const isOctave = fretNumber === 12;
                  const isFirstFret = fretIndex === 0;
                  const isMiddleString = stringIndex === 2; // G string is now at index 2 (3rd from top)
                  let fretClasses = styles.fret;
                  if (isFirstFret) fretClasses += ` ${styles.firstFret}`;
                  if (isOctave) fretClasses += ` ${styles.octaveFret}`;

                  // Show markers only on the D string but position them to appear centered between D and G
                  if (isMarkerFret && !isDoubleMarker && isMiddleString) {
                    fretClasses += ` ${styles.markerFret}`;
                  }
                  if (isDoubleMarker && isMiddleString) {
                    fretClasses += ` ${styles.doubleMarkerFret}`;
                  }

                  const cellId = `${stringIndex}:${fretNumber}`;
                  if (showCagedNotes && cagedHighlightedCells[cellId]) {
                    fretClasses += ` ${styles.cagedFret}`;
                  }

                  return (
                    <div
                      key={`fret-${fretNumber}`}
                      className={fretClasses}
                      style={{ width: fretWidthCss(fretNumber) }}
                      data-fret={`${stringIndex}-${fretIndex}`}
                      data-string={stringIndex}
                      data-fret-number={fretNumber}
                    >
                    </div>
                  );
                })}
              </div>
            ))}

            <div className={styles.selectionLayer}>
              {Object.entries(chordMarkerPositions).map(([cellId, pos]) => (
                <span
                  key={`chord-${cellId}`}
                  className={`${styles.chordSelectionMarker} ${chordSelectedCellIsRoot[cellId] === false ? styles.selectionMarkerNonRoot : ""} ${chordSelectedCellTones[cellId] === "dim" ? styles.selectionMarkerDim : ""}`}
                  style={{ left: pos.x, top: pos.y }}
                />
              ))}
              {Object.entries(selectedMarkerPositions).map(([cellId, pos]) => (
                <span
                  key={`selected-${cellId}`}
                  className={`${styles.selectionMarker} ${selectedCellTones[cellId] === "dim" ? styles.selectionMarkerDim : ""}`}
                  style={{ left: pos.x, top: pos.y }}
                />
              ))}
            </div>

            {/* Render multiple overlays in alternating pattern based on continuous fret position */}
            {Array.from({ length: 21 }, (_, i) => {
              const cycleOffset = Math.floor(i / 2) - 5;
              const isFirst = i % 2 === 0;
              const OverlayComponent = isFirst ? FirstOverlay : SecondOverlay;
              const bgVariant = isFirst
                ? swapBg
                  ? "B"
                  : "A"
                : swapBg
                  ? "A"
                  : "B";
              const zIndex = isFirst ? 999 : 1001;

              // OverlayRow already accounts for `overlayFretOffset` when computing
              // its horizontal placement (including tapered frets via fretMetrics).
              // If we also shift X here, copies get double-shifted and only the
              // middle tile stays on-screen.
              const shiftedX = currentPosition.x;
              return (
                <OverlayComponent
                  key={`overlay-${cycleOffset}-${isFirst ? "A" : "B"}`}
                  isVisible={isOverlayVisible}
                  mousePosition={{
                    x: shiftedX,
                    y: currentPosition.y,
                  }}
                  snappedPosition={{
                    x: shiftedX,
                    y: currentPosition.y,
                  }}
                  cellWidth={cellWidth}
                  cellHeight={cellHeight}
                  currentFret={currentFret}
                  showDimmedNotes={showDimmedNotes}
                  tuning={tuning}
                  bgVariant={bgVariant}
                  zIndex={zIndex}
                  showDegrees={showDegrees}
                  toggledCells={toggledCells}
                  onCellToggle={handleCellToggle}
                  fretMetrics={fretMetrics ?? undefined}
                  overlayFretOffset={cycleOffset * 12}
                />
              );
            })}
          </div>
        </div>
        </div>
      </div>

      <div className={styles.arrowsDock}>
        <div className={styles.arrowsDockWideItem}>
          <FretboardArrows onNavigate={navigate} />
        </div>
        <button
          type="button"
          className={`${styles.arrowsDockButton} ${styles.arrowsDockItem}`}
          onClick={clearSelectedNotes}
        >
          Clear Selected
        </button>

        <label className={`${controlStyles.toggleLabel} ${styles.arrowsDockItem}`}>
          <input
            className={controlStyles.toggleCheckbox}
            type="checkbox"
            checked={showDimmedNotes}
            onChange={() => setShowDimmedNotes(!showDimmedNotes)}
          />
          <span className={controlStyles.toggleText}>Dimmed Notes</span>
        </label>

        <label className={`${controlStyles.toggleLabel} ${styles.arrowsDockItem}`}>
          <input
            className={controlStyles.toggleCheckbox}
            type="checkbox"
            checked={showDegrees}
            onChange={() => setShowDegrees((v) => !v)}
          />
          <span className={controlStyles.toggleText}>Scale Degrees</span>
        </label>

        <label className={`${controlStyles.toggleLabel} ${styles.arrowsDockItem}`}>
          <input
            className={controlStyles.toggleCheckbox}
            type="checkbox"
            checked={followChords}
            onChange={() => setFollowChords((v) => !v)}
          />
          <span className={controlStyles.toggleText}>Follow Chords</span>
        </label>

        <label className={`${controlStyles.toggleLabel} ${styles.arrowsDockItem}`}>
          <input
            className={controlStyles.toggleCheckbox}
            type="checkbox"
            checked={showCagedNotes}
            onChange={() => setShowCagedNotes((v) => !v)}
          />
          <span className={controlStyles.toggleText}>CAGED</span>
        </label>
      </div>

      <FretboardControls
        metronomeState={metronomeState}
        metronomeBeat={metronomeBeat}
        bpm={bpm}
        metronomeVolume={metronomeVolume}
        onPlayPauseMetronome={playPauseMetronome}
        onStopMetronome={stopMetronome}
        onBpmChange={(next) => {
          if (!Number.isFinite(next)) return;
          setBpm(Math.max(30, Math.min(300, next)));
        }}
        onMetronomeVolumeChange={(next) => {
          if (!Number.isFinite(next)) return;
          setMetronomeVolume(Math.max(0, Math.min(1, next)));
        }}
        onSeekToBeat={seekMetronomeToBeat}
        onActiveBeatKeyChange={setActiveBeatKeyText}
        onActiveBeatChordChange={setActiveBeatChordText}
      />
    </div>
  );
}
