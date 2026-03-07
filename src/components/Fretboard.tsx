"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import FirstOverlay from "./FirstOverlay";
import * as styles from "./Fretboard.css";
import FretboardArrows, { type ArrowKey } from "./FretboardArrows";
import FretboardControls from "./FretboardControls";
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

  // Metronome (header, top-right)
  const [bpm, setBpm] = useState(120);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalIdRef = useRef<number | null>(null);
  const nextClickTimeRef = useRef(0);
  const beatIndexRef = useRef(0);
  const bpmRef = useRef(bpm);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  const stopMetronome = useCallback(() => {
    if (intervalIdRef.current != null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    setMetronomeOn(false);
  }, []);

  const scheduleClick = useCallback(
    (ctx: AudioContext, time: number, isAccent: boolean) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.value = isAccent ? 1200 : 900;

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.35, time + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.035);
    },
    [],
  );

  const startMetronome = useCallback(async () => {
    if (metronomeOn) return;

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
    nextClickTimeRef.current = ctx.currentTime + 0.05;
    beatIndexRef.current = 0;

    const scheduler = () => {
      const bpmNow = Math.max(30, Math.min(300, bpmRef.current || 120));
      const secondsPerBeat = 60 / bpmNow;
      while (nextClickTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_S) {
        const isAccent = beatIndexRef.current % 4 === 0;
        scheduleClick(ctx, nextClickTimeRef.current, isAccent);
        nextClickTimeRef.current += secondsPerBeat;
        beatIndexRef.current = (beatIndexRef.current + 1) % 4;
      }
    };

    setMetronomeOn(true);
    scheduler();
    intervalIdRef.current = window.setInterval(scheduler, LOOKAHEAD_MS);
  }, [metronomeOn, scheduleClick]);

  useEffect(() => {
    return () => {
      if (intervalIdRef.current != null) {
        window.clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, []);
  const fretboardRef = useRef<HTMLDivElement>(null);
  const fretboardWrapperRef = useRef<HTMLDivElement>(null);
  const [selectedMarkerPositions, setSelectedMarkerPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [fretMetrics, setFretMetrics] = useState<FretMetrics | null>(null);

  const clearSelectedNotes = useCallback(() => {
    setToggledCells({});
    setSelectedCellTones({});
  }, []);

  const selectCagedNotes = useCallback(() => {
    if (!currentFret) return;

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

    const next: ToggledCellMap = {};
    const nextTones: Record<string, MarkerTone> = {};

    // Determine the current tonic (degree 1) using the same "best key" heuristic as overlays.
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
          const fretNumber =
            currentFret.fret + row.startFret + totalShiftFrets + i;
          const note = getNoteAtPosition(row.stringIndex, fretNumber, tuning);
          centerNotes.push(note);
        }
      }
    };
    collectCenterNotes(firstOverlayRows);
    collectCenterNotes(secondOverlayRows);

    const { displayKey } = computeGlobalDisplayKey(centerNotes);
    const tonicRaw = displayKeyToRawTonic(displayKey);
    const primaryRawNotes = computeMajorTriadRawNotes(tonicRaw);

    const addOverlaySelections = (
      rows: { stringIndex: number; startFret: number; numFrets: number }[],
    ) => {
      for (const row of rows) {
        const tuningShiftFrets =
          tuning === "allFourths" && (row.stringIndex === 0 || row.stringIndex === 1)
            ? -1
            : 0;
        const totalShiftFrets = overlayShiftFrets + tuningShiftFrets;

        for (let i = 0; i < row.numFrets; i++) {
          // Match the overlay's always-visible (highlighted) columns.
          if (i % 2 !== 0) continue;
          const baseFret =
            currentFret.fret + row.startFret + totalShiftFrets + i;

          for (const cycleOffset of octaveCycleOffsets) {
            const fretNumber = baseFret + cycleOffset * 12;
            if (fretNumber < 1 || fretNumber > 24) continue;
            const cellId = `${row.stringIndex}:${fretNumber}`;
            next[cellId] = true;

            const rawNote = getNoteAtPosition(row.stringIndex, fretNumber, tuning);
            nextTones[cellId] = primaryRawNotes.has(rawNote) ? "primary" : "dim";
          }
        }
      }
    };

    addOverlaySelections(firstOverlayRows);
    addOverlaySelections(secondOverlayRows);

    setToggledCells(next);
    setSelectedCellTones(nextTones);
  }, [currentFret, tuning]);
  const [cellWidth, setCellWidth] = useState(64);
  const [cellHeight, setCellHeight] = useState(48);
  const [fretboardScale, setFretboardScale] = useState(1);
  const [scaledWrapperHeightPx, setScaledWrapperHeightPx] = useState<
    number | null
  >(null);

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
      if (
        e.key !== "ArrowUp" &&
        e.key !== "ArrowDown" &&
        e.key !== "ArrowLeft" &&
        e.key !== "ArrowRight"
      ) {
        return;
      }

      e.preventDefault();
      navigate(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
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
        <h1 className={styles.pageTitle}>Guitar Fretboard Visualizer</h1>

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
            <option value="standard">Standard (E-A-D-G-B-E)</option>
            <option value="allFourths">All Fourths (E-A-D-G-C-F)</option>
          </select>
        </div>
      </div>
      <div
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
            transformOrigin: "top center",
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
        <FretboardArrows onNavigate={navigate} />
      </div>

      <FretboardControls
        showDimmedNotes={showDimmedNotes}
        onToggleDimmedNotes={() => setShowDimmedNotes(!showDimmedNotes)}
        showDegrees={showDegrees}
        onToggleDegrees={() => setShowDegrees((v) => !v)}
        onSelectCagedNotes={selectCagedNotes}
        onClearSelectedNotes={clearSelectedNotes}
        metronomeOn={metronomeOn}
        bpm={bpm}
        onToggleMetronome={() => {
          if (metronomeOn) stopMetronome();
          else startMetronome();
        }}
        onBpmChange={(next) => {
          if (!Number.isFinite(next)) return;
          setBpm(Math.max(30, Math.min(300, next)));
        }}
      />
    </div>
  );
}
