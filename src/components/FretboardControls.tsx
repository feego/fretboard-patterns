"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import * as styles from "./FretboardControls.css";

type ChordValidationResult = { valid: true } | { valid: false; error: string };

function normalizeChordInput(input: string): string {
  // Users often type spaces around slash chords (e.g. "C / E").
  return input.trim().replace(/\s+/g, "");
}

function isNoteToken(token: string): boolean {
  return /^[A-G](?:#|b)?$/.test(token);
}

function validateChordSymbol(raw: string): ChordValidationResult {
  const chord = normalizeChordInput(raw);
  if (!chord) return { valid: true };

  // Common "no chord" markers.
  if (/^(?:N\.?C\.?|NC)$/i.test(chord)) return { valid: true };
  if (chord === "-" || chord === "—") return { valid: true };
  // Common "repeat previous" marker in charts.
  if (chord === "%") return { valid: true };

  // Only allow a limited, musician-friendly character set.
  // (Still parsed below; this is just an early reject for typos.)
  if (!/^[A-Za-z0-9#b()\-+°øΔ.,\/]+$/.test(chord)) {
    return { valid: false, error: "Invalid characters" };
  }

  const parts = chord.split("/");
  if (parts.length > 2) return { valid: false, error: "Too many '/'" };

  const base = parts[0];
  const bass = parts[1];

  const baseMatch = /^([A-G](?:#|b)?)(.*)$/.exec(base);
  if (!baseMatch) return { valid: false, error: "Chord must start with A–G" };

  const [, root, rawSuffix] = baseMatch;
  if (!isNoteToken(root)) return { valid: false, error: "Invalid root note" };
  if (bass != null && bass.length > 0 && !isNoteToken(bass)) {
    return { valid: false, error: "Invalid slash bass note" };
  }

  const suffix = rawSuffix;
  if (!suffix) return { valid: true };

  // More complete parser for common chord spellings.
  // Supports qualities: maj, min, m, dim, aug, sus(2/4), °, ø, Δ
  // Supports extensions: 2,4,5,6,7,9,11,13,69
  // Supports alterations: b/# + (3,5,9,11,13) e.g. b5, #11
  // Supports add/omit/no: add9, omit3, no5
  // Supports optional parenthetical tensions: C7(b9,#11)
  const s = suffix;
  const lower = s.toLowerCase();

  const isBalancedParens = (text: string) => {
    let depth = 0;
    for (const ch of text) {
      if (ch === "(") depth++;
      else if (ch === ")") {
        depth--;
        if (depth < 0) return false;
      }
    }
    return depth === 0;
  };

  if (!isBalancedParens(s)) {
    return { valid: false, error: "Unbalanced parentheses" };
  }

  const allowedNumbers = new Set(["2", "4", "5", "6", "7", "9", "11", "13", "69"]);
  const allowedAlterNumbers = new Set(["3", "5", "9", "11", "13"]);

  const parseNumberAt = (text: string, i: number) => {
    // Prefer 2-digit degrees when possible.
    const two = text.slice(i, i + 2);
    if (two === "11" || two === "13" || two === "69") return { num: two, next: i + 2 };
    const one = text.slice(i, i + 1);
    if (/^[0-9]$/.test(one)) return { num: one, next: i + 1 };
    return null;
  };

  const parseAlterationAt = (text: string, i: number) => {
    const acc = text[i];
    if (acc !== "b" && acc !== "#") return null;
    const parsed = parseNumberAt(text, i + 1);
    if (!parsed) return null;
    if (!allowedAlterNumbers.has(parsed.num)) return null;
    return { next: parsed.next };
  };

  const parseKeywordAt = (textLower: string, i: number, keyword: string) =>
    textLower.startsWith(keyword, i) ? i + keyword.length : null;

  const parseParenGroupAt = (text: string, i: number) => {
    if (text[i] !== "(") return null;
    const close = text.indexOf(")", i + 1);
    if (close < 0) return null;
    const inner = text.slice(i + 1, close);
    if (inner.trim().length === 0) return null;

    // Allow comma-separated alterations like b9,#11 or add9.
    const pieces = inner.split(",").map((p) => p.trim());
    for (const piece of pieces) {
      if (!piece) return null;

      const pieceLower = piece.toLowerCase();
      let j = 0;

      const addAt = parseKeywordAt(pieceLower, j, "add");
      if (addAt != null) {
        j = addAt;
        const parsed = parseNumberAt(piece, j);
        if (!parsed || !allowedNumbers.has(parsed.num)) return null;
        j = parsed.next;
        if (j !== piece.length) return null;
        continue;
      }

      const altParsed = parseAlterationAt(pieceLower, j);
      if (altParsed) {
        j = altParsed.next;
        if (j !== piece.length) return null;
        continue;
      }

      // A bare degree inside parens (e.g. (9))
      const deg = parseNumberAt(piece, j);
      if (deg && allowedNumbers.has(deg.num) && deg.next === piece.length) {
        continue;
      }

      return null;
    }

    return { next: close + 1 };
  };

  let i = 0;

  // Quality tokens (optional)
  const tryQuality = () => {
    // Order matters.
    const qMaj = parseKeywordAt(lower, i, "maj");
    if (qMaj != null) return (i = qMaj);

    const qMin = parseKeywordAt(lower, i, "min");
    if (qMin != null) return (i = qMin);

    const qDim = parseKeywordAt(lower, i, "dim");
    if (qDim != null) return (i = qDim);

    const qAug = parseKeywordAt(lower, i, "aug");
    if (qAug != null) return (i = qAug);

    const qSus2 = parseKeywordAt(lower, i, "sus2");
    if (qSus2 != null) return (i = qSus2);

    const qSus4 = parseKeywordAt(lower, i, "sus4");
    if (qSus4 != null) return (i = qSus4);

    const qSus = parseKeywordAt(lower, i, "sus");
    if (qSus != null) return (i = qSus);

    // Single-char qualities.
    const ch = s[i];
    if (ch === "Δ") return (i += 1);
    if (ch === "°" || ch === "ø") return (i += 1);

    // "m" as shorthand minor (but not if it's start of maj/min)
    if (lower[i] === "m") return (i += 1);

    // '-' as minor shorthand (common in some charts)
    if (s[i] === "-") return (i += 1);

    // '+' as augmented shorthand
    if (s[i] === "+") return (i += 1);
  };

  tryQuality();

  while (i < s.length) {
    // Parenthetical tensions like (b9,#11)
    const paren = parseParenGroupAt(s, i);
    if (paren) {
      i = paren.next;
      continue;
    }

    // Keywords: add9 / omit3 / no5 / alt
    const addNext = parseKeywordAt(lower, i, "add");
    if (addNext != null) {
      i = addNext;
      const parsed = parseNumberAt(s, i);
      if (!parsed || !allowedNumbers.has(parsed.num)) {
        return { valid: false, error: "Invalid add degree" };
      }
      i = parsed.next;
      continue;
    }

    const omitNext = parseKeywordAt(lower, i, "omit");
    if (omitNext != null) {
      i = omitNext;
      const parsed = parseNumberAt(s, i);
      if (!parsed || (parsed.num !== "3" && parsed.num !== "5")) {
        return { valid: false, error: "omit must be 3 or 5" };
      }
      i = parsed.next;
      continue;
    }

    const noNext = parseKeywordAt(lower, i, "no");
    if (noNext != null) {
      i = noNext;
      const parsed = parseNumberAt(s, i);
      if (!parsed || (parsed.num !== "3" && parsed.num !== "5")) {
        return { valid: false, error: "no must be 3 or 5" };
      }
      i = parsed.next;
      continue;
    }

    const altNext = parseKeywordAt(lower, i, "alt");
    if (altNext != null) {
      i = altNext;
      continue;
    }

    // Alterations: b5, #11, etc.
    const alt = parseAlterationAt(lower, i);
    if (alt) {
      i = alt.next;
      continue;
    }

    // Plain degrees/extensions: 7, 9, 11, 13, 69
    const deg = parseNumberAt(s, i);
    if (deg) {
      if (!allowedNumbers.has(deg.num)) {
        return { valid: false, error: `Unsupported degree ${deg.num}` };
      }
      i = deg.next;
      continue;
    }

    // If we get here, we couldn't parse the next token.
    return { valid: false, error: "Unrecognized chord modifier" };
  }

  return { valid: true };
}

function getBeatFitCh(chordText: string): number {
  // Tune so the grid feels iReal-like but still expands for longer symbols.
  // Using ch units keeps it font-relative and cheap to compute.
  const len = chordText.trim().length;

  // Keep empty/short chords compact.
  if (len <= 1) return 6;
  return Math.min(24, Math.max(6, len + 2));
}

function getBeatWeight(chordText: string): number {
  // Heavier weighting than fit-content so you can *see* the column grow.
  const len = chordText.trim().length;
  if (len === 0) return 1;
  return Math.min(12, len + 2);
}

interface FretboardControlsProps {
  metronomeState: "stopped" | "running" | "paused";
  metronomeBeat: number | null;
  bpm: number;
  onPlayPauseMetronome: () => void;
  onStopMetronome: () => void;
  onBpmChange: (bpm: number) => void;
  onSeekToBeat?: (beatIndex: number) => void;
  onActiveBeatKeyChange?: (keyText: string) => void;
  onActiveBeatChordChange?: (chordText: string) => void;
}

export default function FretboardControls({
  metronomeState,
  metronomeBeat,
  bpm,
  onPlayPauseMetronome,
  onStopMetronome,
  onBpmChange,
  onSeekToBeat,
  onActiveBeatKeyChange,
  onActiveBeatChordChange,
}: FretboardControlsProps) {
  const [isDesktopGrid, setIsDesktopGrid] = useState(false);
  const [isMobileGrid, setIsMobileGrid] = useState(false);

  type BuiltInSongId = "blank" | "allTheThingsYouAre";
  type SongId = BuiltInSongId | string;
  type SavedSong = {
    id: string;
    name: string;
    bars: string[][];
    beatKeys: string[][];
    bpm: number;
    createdAt: number;
  };

  const SONGS_STORAGE_KEY = "gfv:songs:v1";
  const SELECTED_SONG_ID_STORAGE_KEY = "gfv:selectedSongId:v1";

  const [selectedSongId, setSelectedSongId] = useState<SongId>(
    "allTheThingsYouAre",
  );
  const [savedSongs, setSavedSongs] = useState<SavedSong[]>([]);
  const [isSavingSong, setIsSavingSong] = useState(false);
  const [songNameDraft, setSongNameDraft] = useState("");
  const songNameInputRef = useRef<HTMLInputElement | null>(null);
  const hasRestoredSelectedSongRef = useRef(false);
  const hasRunPersistSelectedSongEffectRef = useRef(false);

  const selectedSavedSong = useMemo(() => {
    if (selectedSongId === "blank" || selectedSongId === "allTheThingsYouAre") {
      return null;
    }
    return savedSongs.find((s) => s.id === selectedSongId) ?? null;
  }, [savedSongs, selectedSongId]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const onChange = () => setIsDesktopGrid(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    const onChange = () => setIsMobileGrid(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const [bars, setBars] = useState<string[][]>(() =>
    Array.from({ length: 12 }, () => ["", "", "", ""]),
  );
  const [beatKeys, setBeatKeys] = useState<string[][]>(() =>
    Array.from({ length: 12 }, () => ["", "", "", ""]),
  );

  const chordBeatInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const keyBeatInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const focusBeatInput = (
    flatBeat: number,
    kind: "chord" | "key",
    caret: "start" | "end",
  ) => {
    const el =
      kind === "chord"
        ? chordBeatInputRefs.current[flatBeat]
        : keyBeatInputRefs.current[flatBeat];
    if (!el) return;

    el.focus();

    const len = el.value.length;
    const pos = caret === "start" ? 0 : len;
    try {
      el.setSelectionRange(pos, pos);
    } catch {
      // Some input types / environments can throw; focusing is still useful.
    }
  };

  const handleBeatArrowKeyDown = (
    e: ReactKeyboardEvent<HTMLInputElement>,
    flatBeat: number,
    kind: "chord" | "key",
  ) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

    // Preserve OS/browser shortcuts like Cmd/Opt/Shift+Arrow.
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

    const target = e.currentTarget;
    const { selectionStart, selectionEnd } = target;
    if (selectionStart == null || selectionEnd == null) return;
    if (selectionStart !== selectionEnd) return;

    const totalBeats = bars.length * 4;

    if (e.key === "ArrowRight") {
      if (selectionEnd !== target.value.length) return;
      const nextBeat = flatBeat + 1;
      if (nextBeat >= totalBeats) return;

      e.preventDefault();
      e.stopPropagation();

      onSeekToBeat?.(nextBeat);
      requestAnimationFrame(() => focusBeatInput(nextBeat, kind, "start"));
      return;
    }

    // ArrowLeft
    if (selectionStart !== 0) return;
    const prevBeat = flatBeat - 1;
    if (prevBeat < 0) return;

    e.preventDefault();
    e.stopPropagation();

    onSeekToBeat?.(prevBeat);
    requestAnimationFrame(() => focusBeatInput(prevBeat, kind, "end"));
  };

  const resetToEmptyGrid = () => {
    setBars(Array.from({ length: 12 }, () => ["", "", "", ""]));
    setBeatKeys(Array.from({ length: 12 }, () => ["", "", "", ""]));
  };

  const allTheThingsSpec = useMemo(
    () =>
      [
        "Fm7",
        "Bbm7",
        "Eb7",
        "Abmaj7",
        "Dbmaj7",
        "Dm7 G7",
        "Cmaj7",
        "%",
        "Cm7",
        "Fm7",
        "Bb7",
        "Ebmaj7",
        "Abmaj7",
        "Am7 D7",
        "Gmaj7",
        "%",
        "Am7",
        "D7",
        "Gmaj7",
        "%",
        "F#m7b5",
        "B7",
        "Emaj7",
        "C7",
        "Fm7",
        "Bbm7",
        "Eb7",
        "Abmaj7",
        "Dbmaj7",
        "Dbm7 Gb7",
        "Abmaj7",
        "Bdim",
        "Bbm7",
        "Eb7",
        "Abmaj7",
        "%",
      ] as const,
    [],
  );

  const allTheThingsKeysSpec = useMemo(
    () =>
      [
        // Bar-level key centers (rendered on beat 1). Empty string = none.
        "Ab",
        "",
        "",
        "",
        "",
        "c",
        "",
        "",
        "Eb",
        "",
        "",
        "",
        "",
        "G",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "E",
        "Ab",
        "",
        "",
        "",
        "",
        "",
        "B",
        "Ab",
        "",
        "",
        "",
        "",
        "",
      ] as const,
    [],
  );

  const loadSavedSongs = () => {
    try {
      const raw = window.localStorage.getItem(SONGS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      const next: SavedSong[] = [];
      for (const item of parsed) {
        if (
          !item ||
          typeof item !== "object" ||
          typeof (item as any).id !== "string" ||
          typeof (item as any).name !== "string" ||
          !Array.isArray((item as any).bars) ||
          !Array.isArray((item as any).beatKeys)
        ) {
          continue;
        }
        next.push({
          id: (item as any).id,
          name: (item as any).name,
          bars: (item as any).bars,
          beatKeys: (item as any).beatKeys,
          bpm:
            typeof (item as any).bpm === "number" && Number.isFinite((item as any).bpm)
              ? (item as any).bpm
              : bpm,
          createdAt:
            typeof (item as any).createdAt === "number" ? (item as any).createdAt : 0,
        });
      }
      // Newest first.
      next.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return next;
    } catch {
      return [];
    }
  };

  const persistSavedSongs = (songs: SavedSong[]) => {
    try {
      window.localStorage.setItem(SONGS_STORAGE_KEY, JSON.stringify(songs));
    } catch {
      // ignore
    }
  };

  const loadSelectedSongId = (): SongId | null => {
    try {
      const raw = window.localStorage.getItem(SELECTED_SONG_ID_STORAGE_KEY);
      if (!raw) return null;
      if (typeof raw !== "string") return null;
      return raw as SongId;
    } catch {
      return null;
    }
  };

  const persistSelectedSongId = (songId: SongId) => {
    try {
      window.localStorage.setItem(SELECTED_SONG_ID_STORAGE_KEY, String(songId));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const songs = loadSavedSongs();
    setSavedSongs(songs);

    const stored = loadSelectedSongId();
    const exists =
      stored != null &&
      (stored === "blank" ||
        stored === "allTheThingsYouAre" ||
        songs.some((s) => s.id === stored));

    const nextId: SongId = exists
      ? (stored as SongId)
      : "allTheThingsYouAre";
    setSelectedSongId(nextId);
    applySongById(nextId, songs);

    hasRestoredSelectedSongRef.current = true;
  }, []);

  // Persist selected song whenever it changes (after initial restore attempt).
  useEffect(() => {
    if (!hasRestoredSelectedSongRef.current) return;

    // On first mount, this effect would otherwise run with the initial
    // selectedSongId ("blank") and overwrite the restored selection in storage
    // before state commits. Skip the first run; subsequent changes persist.
    if (!hasRunPersistSelectedSongEffectRef.current) {
      hasRunPersistSelectedSongEffectRef.current = true;
      return;
    }

    persistSelectedSongId(selectedSongId);
  }, [selectedSongId]);

  const applySongById = (songId: SongId, songs: SavedSong[] = savedSongs) => {
    if (songId === "blank") {
      resetToEmptyGrid();
      return;
    }

    if (songId === "allTheThingsYouAre") {
      const nextBars: string[][] = allTheThingsSpec.map((barText) => {
        const trimmed = barText.trim();
        if (!trimmed) return ["", "", "", ""];

        const parts = trimmed.split(/\s+/).filter(Boolean);
        if (parts.length <= 1) return [parts[0] ?? "", "", "", ""];
        return [parts[0] ?? "", "", parts[1] ?? "", ""];
      });
      setBars(nextBars);
      const nextKeys: string[][] = nextBars.map((_, barIndex) => {
        const key = allTheThingsKeysSpec[barIndex] ?? "";
        return [key, "", "", ""];
      });
      setBeatKeys(nextKeys);
      return;
    }

    const saved = songs.find((s) => s.id === songId);
    if (!saved) return;

    setBars(saved.bars);
    setBeatKeys(saved.beatKeys);
    if (typeof saved.bpm === "number" && Number.isFinite(saved.bpm)) {
      onBpmChange(saved.bpm);
    }
  };

  const deleteSavedSongById = (songId: string) => {
    const existing = savedSongs.find((s) => s.id === songId);
    if (!existing) return;

    const ok =
      typeof window !== "undefined" &&
      window.confirm(`Delete song "${existing.name}"? This can't be undone.`);
    if (!ok) return;

    const next = savedSongs.filter((s) => s.id !== songId);
    setSavedSongs(next);
    persistSavedSongs(next);

    // Keep UI consistent: if we deleted the selected song, fall back to Blank.
    if (selectedSongId === songId) {
      setSelectedSongId("allTheThingsYouAre");
      persistSelectedSongId("allTheThingsYouAre");
      applySongById("allTheThingsYouAre", next);
    }
  };

  useEffect(() => {
    if (!isSavingSong) return;
    const t = window.setTimeout(() => songNameInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [isSavingSong]);

  const totalBeats = bars.length * 4;
  const metronomeActive = metronomeState !== "stopped" || metronomeBeat != null;
  const activeFlatBeat =
    metronomeActive && metronomeBeat != null && totalBeats > 0
      ? ((metronomeBeat % totalBeats) + totalBeats) % totalBeats
      : null;
  const activeBarIndex =
    activeFlatBeat != null ? Math.floor(activeFlatBeat / 4) : null;
  const activeBeatIndex = activeFlatBeat != null ? activeFlatBeat % 4 : null;

  useEffect(() => {
    if (!onSeekToBeat) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.metaKey) return;
      if (e.ctrlKey || e.altKey) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

      // Intentionally allow this shortcut even when a chord/key input is focused.
      // (Default browser/input behavior for Cmd+Arrow is "jump to start/end".)

      if (metronomeBeat == null) return;
      const totalBars = bars.length;
      if (totalBars <= 0) return;

      const total = totalBars * 4;
      const flat = ((metronomeBeat % total) + total) % total;
      const barIndex = Math.floor(flat / 4);

      const nextBarIndex =
        e.key === "ArrowRight"
          ? (barIndex + 1) % totalBars
          : (barIndex - 1 + totalBars) % totalBars;

      e.preventDefault();
      e.stopPropagation();
      onSeekToBeat(nextBarIndex * 4);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onSeekToBeat, metronomeBeat, bars.length]);

  useEffect(() => {
    if (!onActiveBeatKeyChange) return;

    if (!metronomeActive || activeBarIndex == null || activeBeatIndex == null) {
      onActiveBeatKeyChange("");
      return;
    }

    const totalBars = beatKeys.length;
    if (totalBars <= 0) {
      onActiveBeatKeyChange("");
      return;
    }

    const getDefinedKeyForBar = (barIndex: number): string => {
      const beats = beatKeys[barIndex];
      if (!beats) return "";
      for (const maybeKey of beats) {
        const trimmed = (maybeKey ?? "").trim();
        if (trimmed) return trimmed;
      }
      return "";
    };

    // Spec: key should match the last bar before the selected bar that has a defined key.
    // We interpret this as: find the nearest previous bar (including current, if it defines a key)
    // with any non-empty key field, scanning backwards and wrapping.
    const startBar = ((activeBarIndex % totalBars) + totalBars) % totalBars;
    let resolvedKey = "";

    for (let step = 0; step < totalBars; step++) {
      const barIdx = (startBar - step + totalBars) % totalBars;
      const candidate = getDefinedKeyForBar(barIdx);
      if (candidate) {
        resolvedKey = candidate;
        break;
      }
    }

    onActiveBeatKeyChange(resolvedKey);
  }, [
    onActiveBeatKeyChange,
    metronomeActive,
    activeBarIndex,
    activeBeatIndex,
    beatKeys,
  ]);

  useEffect(() => {
    if (!onActiveBeatChordChange) return;

    if (!metronomeActive || activeBarIndex == null || activeBeatIndex == null) {
      onActiveBeatChordChange("");
      return;
    }

    const raw = bars[activeBarIndex]?.[activeBeatIndex] ?? "";
    const trimmed = raw.trim();
    const upper = trimmed.toUpperCase();
    const isRepeat = trimmed === "%";
    const isNoChord = upper === "NC" || upper === "N.C.";

    if (!isRepeat) {
      onActiveBeatChordChange(isNoChord ? "" : raw);
      return;
    }

    const total = bars.length * 4;
    if (total <= 0) {
      onActiveBeatChordChange("");
      return;
    }

    const flat = activeBarIndex * 4 + activeBeatIndex;
    let resolved = "";

    // Walk backwards (wrapping) to find the last non-empty, non-repeat chord.
    for (let step = 1; step <= total; step++) {
      const idx = (flat - step + total) % total;
      const barIdx = Math.floor(idx / 4);
      const beatIdx = idx % 4;
      const candidateRaw = bars[barIdx]?.[beatIdx] ?? "";
      const candidateTrimmed = candidateRaw.trim();
      if (!candidateTrimmed) continue;
      if (candidateTrimmed === "%") continue;
      const candidateUpper = candidateTrimmed.toUpperCase();
      if (candidateUpper === "NC" || candidateUpper === "N.C.") continue;
      resolved = candidateRaw;
      break;
    }

    onActiveBeatChordChange(resolved);
  }, [
    onActiveBeatChordChange,
    metronomeActive,
    activeBarIndex,
    activeBeatIndex,
    bars,
  ]);

  const insertBarRightOf = (barIndex: number) => {
    const insertAt = Math.min(barIndex + 1, bars.length);

    setBars((prev) => {
      const copy = [...prev];
      copy.splice(insertAt, 0, ["", "", "", ""]);
      return copy;
    });

    setBeatKeys((prev) => {
      const copy = [...prev];
      copy.splice(insertAt, 0, ["", "", "", ""]);
      return copy;
    });
  };

  const removeBarAt = (barIndex: number) => {
    if (bars.length <= 1) return;

    setBars((prev) => {
      const copy = [...prev];
      copy.splice(barIndex, 1);
      return copy;
    });

    setBeatKeys((prev) => {
      const copy = [...prev];
      copy.splice(barIndex, 1);
      return copy;
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.chordsTopRightRow}>
        <div
          className={`${styles.songPicker} ${isSavingSong ? styles.songPickerSaving : ""}`}
        >
          {isSavingSong ? (
            <>
              <div className={styles.songPickerRow}>
                <input
                  id="song-name"
                  ref={songNameInputRef}
                  className={styles.songNameInput}
                  type="text"
                  value={songNameDraft}
                  placeholder="Song name"
                  onChange={(e) => setSongNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setIsSavingSong(false);
                      setSongNameDraft("");
                      return;
                    }

                    if (e.key === "Enter") {
                      e.preventDefault();
                      const name = songNameDraft.trim();
                      if (!name) return;

                      const createdAt = Date.now();
                      const id =
                        typeof crypto !== "undefined" &&
                        "randomUUID" in crypto &&
                        typeof (crypto as any).randomUUID === "function"
                          ? (crypto as any).randomUUID()
                          : String(createdAt);

                      const nextSong: SavedSong = {
                        id,
                        name,
                        bars,
                        beatKeys,
                        bpm,
                        createdAt,
                      };

                      const next = [
                        nextSong,
                        ...savedSongs.filter((s) => s.name !== name),
                      ];
                      setSavedSongs(next);
                      persistSavedSongs(next);
                      setSelectedSongId(id);
                      persistSelectedSongId(id);
                      setIsSavingSong(false);
                      setSongNameDraft("");
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.metronomeButton}
                  onClick={() => {
                    const name = songNameDraft.trim();
                    if (!name) return;

                    const createdAt = Date.now();
                    const id =
                      typeof crypto !== "undefined" &&
                      "randomUUID" in crypto &&
                      typeof (crypto as any).randomUUID === "function"
                        ? (crypto as any).randomUUID()
                        : String(createdAt);

                    const nextSong: SavedSong = {
                      id,
                      name,
                      bars,
                      beatKeys,
                      bpm,
                      createdAt,
                    };

                    const next = [
                      nextSong,
                      ...savedSongs.filter((s) => s.name !== name),
                    ];
                    setSavedSongs(next);
                    persistSavedSongs(next);
                    setSelectedSongId(id);
                    persistSelectedSongId(id);
                    setIsSavingSong(false);
                    setSongNameDraft("");
                  }}
                  aria-label="Confirm save song"
                  title="Save"
                >
                  Save
                </button>
                <button
                  type="button"
                  className={styles.metronomeButton}
                  onClick={() => {
                    setIsSavingSong(false);
                    setSongNameDraft("");
                  }}
                  aria-label="Cancel save song"
                  title="Cancel"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <label className={styles.metronomeLabel} htmlFor="song-preset">
                Song
              </label>
              <select
                id="song-preset"
                className={styles.songSelect}
                value={selectedSongId}
                onChange={(e) => {
                  const next = e.target.value as SongId;
                  setSelectedSongId(next);
                  persistSelectedSongId(next);
                  applySongById(next);
                }}
              >
                <option value="blank">Blank</option>
                <option value="allTheThingsYouAre">All the Things You Are</option>
                {savedSongs.map((song) => (
                  <option key={song.id} value={song.id}>
                    {song.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={styles.metronomeButton}
                onClick={() => setIsSavingSong(true)}
                aria-label="Save song preset"
                title="Save"
              >
                Save
              </button>

              {selectedSavedSong ? (
                <button
                  type="button"
                  className={styles.metronomeButton}
                  onClick={() => deleteSavedSongById(selectedSavedSong.id)}
                  aria-label={`Delete song ${selectedSavedSong.name}`}
                  title="Delete"
                >
                  Delete
                </button>
              ) : null}
            </>
          )}
        </div>

        <div className={styles.metronomeControls}>
          <button
            type="button"
            className={styles.metronomeButton}
            onClick={onPlayPauseMetronome}
            aria-label={
              metronomeState === "running"
                ? "Pause metronome"
                : metronomeState === "paused"
                  ? "Resume metronome"
                  : "Start metronome"
            }
            title={
              metronomeState === "running"
                ? "Pause"
                : metronomeState === "paused"
                  ? "Resume"
                  : "Start"
            }
          >
            {metronomeState === "running" ? "⏸" : "▶"}
          </button>

          <button
            type="button"
            className={styles.metronomeButton}
            onClick={onStopMetronome}
            disabled={metronomeState === "stopped" && metronomeBeat == null}
            aria-label="Stop metronome"
            title="Stop"
          >
            ■
          </button>

          <label className={styles.metronomeLabel} htmlFor="chords-bpm">
            BPM
          </label>
          <input
            id="chords-bpm"
            className={styles.metronomeInput}
            type="number"
            min={30}
            max={300}
            step={1}
            value={bpm}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (!Number.isFinite(next)) return;
              onBpmChange(next);
            }}
          />
        </div>
      </div>

      <div className={styles.section} data-chords-editor="true">
        <div className={styles.barsGrid}>
          {bars.map((barBeats, barIndex) => {
            const columns = isDesktopGrid ? 4 : isMobileGrid ? 2 : 1;
            const firstRowLastIndex = Math.min(columns, bars.length) - 1;
            const totalRows = Math.ceil(bars.length / columns);
            const lastRowStartIndex = Math.max(0, (totalRows - 1) * columns);
            const isLastRowFull = bars.length % columns === 0;
            const shouldRoundLastRowRight = totalRows === 1 || isLastRowFull;

            const isTopLeft = barIndex === 0;
            const isTopRight = barIndex === firstRowLastIndex;
            const isBottomLeft = barIndex === lastRowStartIndex;
            const isBottomRight =
              shouldRoundLastRowRight && barIndex === bars.length - 1;

            const isRightEdge =
              columns === 1 ||
              (barIndex + 1) % columns === 0 ||
              barIndex === bars.length - 1;

            const gridTemplateColumns = barBeats
              .map((beatChord) => {
                const trimmed = (beatChord ?? "").trim();
                const isEmpty = trimmed.length === 0;

                // Empty beats shouldn't reserve as much space; otherwise chords get clipped
                // even when there is visually "room" in the bar.
                const minRem = isMobileGrid
                  ? isEmpty
                    ? 2.25
                    : 4.25
                  : isEmpty
                    ? 3.0
                    : 4.25;

                return `minmax(${minRem}rem, ${getBeatWeight(beatChord)}fr)`;
              })
              .join(" ");

            const isLastBar = barIndex === bars.length - 1;
            const isActiveBar = metronomeActive && activeBarIndex === barIndex;
            const canRemove = bars.length > 1;

            return (
              <div
                key={`bar-${barIndex}`}
                className={
                  `${styles.barCell} ` +
                  `${isRightEdge ? styles.barCellRightEdge : ""} ` +
                  `${isLastBar ? styles.barCellLast : ""} ` +
                  `${isActiveBar ? styles.barCellActive : ""} ` +
                  `${isTopLeft ? styles.barCellTopLeft : ""} ` +
                  `${isTopRight ? styles.barCellTopRight : ""} ` +
                  `${isBottomLeft ? styles.barCellBottomLeft : ""} ` +
                  `${isBottomRight ? styles.barCellBottomRight : ""}`
                }
                onPointerDownCapture={(e) => {
                  if (!onSeekToBeat) return;
                  const target = e.target as HTMLElement | null;
                  if (!target) return;

                  // Don't hijack interactions with the bar +/- menu.
                  if (target.closest('[data-bar-menu="true"]')) return;

                  onSeekToBeat(barIndex * 4);
                }}
                onClick={(e) => {
                  if (!onSeekToBeat) return;
                  const target = e.target as HTMLElement | null;
                  if (!target) return;

                  // Don't seek when editing inputs or using bar controls.
                  if (target.closest("input,button,select,textarea,label,a")) return;

                  onSeekToBeat(barIndex * 4);
                }}
              >
                <button
                  type="button"
                  className={styles.barSeekHandle}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSeekToBeat?.(barIndex * 4);
                  }}
                  aria-label={`Set playhead to bar ${barIndex + 1}`}
                  title="Jump playhead to this bar"
                />

                <div className={styles.barMenu} data-bar-menu="true">
                  <button
                    type="button"
                    className={`${styles.barMenuButton} ${styles.barMenuButtonDanger}`}
                    onClick={() => removeBarAt(barIndex)}
                    disabled={!canRemove}
                    aria-disabled={!canRemove}
                    aria-label="Remove bar"
                  >
                    –
                  </button>
                  <button
                    type="button"
                    className={styles.barMenuButton}
                    onClick={() => insertBarRightOf(barIndex)}
                    aria-label="Add bar"
                  >
                    +
                  </button>
                </div>

                <div
                  className={styles.barBeatGrid}
                  style={{ gridTemplateColumns }}
                >
                  {barBeats.map((beatChord, beatIndex) => {
                    const flatBeat = barIndex * 4 + beatIndex;
                    const validation = validateChordSymbol(beatChord);
                    const isInvalid = !validation.valid;
                    const error = isInvalid ? validation.error : undefined;
                    const errorId = isInvalid
                      ? `chord-error-${barIndex}-${beatIndex}`
                      : undefined;

                    return (
                      <div
                        key={`bar-${barIndex}-beat-${beatIndex}`}
                        className={`${styles.beatCell} ${
                          beatIndex === 0
                            ? styles.beatCell0
                            : beatIndex === 1
                              ? styles.beatCell1
                              : beatIndex === 2
                                ? styles.beatCell2
                                : styles.beatCell3
                        } ${isInvalid ? styles.beatCellError : ""}`}
                      >
                        {barIndex === 0 && beatIndex === 0 ? (
                          <div className={styles.beatKeyRow}>
                            <span className={styles.beatKeyInlineLabel}>KEY:</span>
                            <input
                              aria-label={`Bar ${barIndex + 1} Beat ${beatIndex + 1} Key`}
                              className={styles.beatKeyInputWithLabel}
                              type="text"
                              ref={(el) => {
                                keyBeatInputRefs.current[flatBeat] = el;
                              }}
                              value={beatKeys[barIndex]?.[beatIndex] ?? ""}
                              placeholder={barIndex === 0 ? "C" : ""}
                              onKeyDown={(e) =>
                                handleBeatArrowKeyDown(e, flatBeat, "key")
                              }
                              onChange={(e) => {
                                const nextKey = e.target.value;
                                setBeatKeys((prev) => {
                                  const copy = [...prev];
                                  const barCopy = [
                                    ...(copy[barIndex] ?? ["", "", "", ""]),
                                  ];
                                  barCopy[beatIndex] = nextKey;
                                  copy[barIndex] = barCopy;
                                  return copy;
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <input
                            aria-label={`Bar ${barIndex + 1} Beat ${beatIndex + 1} Key`}
                            className={styles.beatKeyInput}
                            type="text"
                            ref={(el) => {
                              keyBeatInputRefs.current[flatBeat] = el;
                            }}
                            value={beatKeys[barIndex]?.[beatIndex] ?? ""}
                            placeholder=""
                            onKeyDown={(e) =>
                              handleBeatArrowKeyDown(e, flatBeat, "key")
                            }
                            onChange={(e) => {
                              const nextKey = e.target.value;
                              setBeatKeys((prev) => {
                                const copy = [...prev];
                                const barCopy = [
                                  ...(copy[barIndex] ?? ["", "", "", ""]),
                                ];
                                barCopy[beatIndex] = nextKey;
                                copy[barIndex] = barCopy;
                                return copy;
                              });
                            }}
                          />
                        )}
                        <input
                          aria-label={`Bar ${barIndex + 1} Beat ${beatIndex + 1}`}
                          className={`${styles.beatChordInput} ${
                            isInvalid ? styles.beatChordInputInvalid : ""
                          }`}
                          type="text"
                          ref={(el) => {
                            chordBeatInputRefs.current[flatBeat] = el;
                          }}
                          value={beatChord}
                          placeholder={
                            barIndex === 0 && beatIndex === 0 ? "Cmaj7" : ""
                          }
                          aria-invalid={isInvalid}
                          aria-describedby={errorId}
                          onKeyDown={(e) =>
                            handleBeatArrowKeyDown(e, flatBeat, "chord")
                          }
                          onChange={(e) => {
                            const nextChord = e.target.value;
                            setBars((prev) => {
                              const copy = [...prev];
                              const barCopy = [...copy[barIndex]];
                              barCopy[beatIndex] = nextChord;
                              copy[barIndex] = barCopy;
                              return copy;
                            });
                          }}
                        />

                        {isInvalid && error ? (
                          <div
                            id={errorId}
                            className={styles.chordErrorTooltip}
                            role="tooltip"
                          >
                            {error}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
