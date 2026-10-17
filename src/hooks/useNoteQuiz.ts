"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getNoteAtPosition, keyPitchClasses, NOTES } from "../lib/notes";

export type QuizMode = "single" | "group";

export interface QuizSettings {
  mode: QuizMode;
  minFret: number;
  maxFret: number;
  /** One flag per string, index 0 = high string (same order as the fretboard rows). */
  strings: boolean[];
  groupSize: number;
  /** Tonic pitch class of the major key to practise, or null for all notes. */
  key: number | null;
}

/** The settings that decide which positions get asked. */
type QuizScope = QuizSettings;

export interface QuizTarget {
  string: number;
  fret: number;
  pc: number;
  /** Pitch class the player answered, once answered. */
  answeredPc: number | null;
}

export interface QuizQuestion {
  id: number;
  targets: QuizTarget[];
  activeIndex: number;
  done: boolean;
}

export interface PositionStat {
  attempts: number;
  correct: number;
  /** Exponential moving average of answer time in ms. */
  avgMs: number;
}

export type PositionStats = Record<string, PositionStat>;

export interface QuizScore {
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
  totalMs: number;
}

export const QUIZ_MIN_FRET = 1;
export const QUIZ_MAX_FRET = 24;
/** Frets a group question may span (hand position). */
const GROUP_SPAN_FRETS = 4;
/** Answer times above this are treated as "player was away", not slowness. */
const MAX_COUNTED_MS = 15000;
const AVG_MS_ALPHA = 0.3;

const SETTINGS_KEY = "fretboard-quiz-settings";
const STATS_KEY = "fretboard-quiz-stats";

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  mode: "single",
  minFret: 1,
  maxFret: 12,
  strings: [true, true, true, true, true, true],
  groupSize: 3,
  key: null,
};

const EMPTY_SCORE: QuizScore = {
  correct: 0,
  total: 0,
  streak: 0,
  bestStreak: 0,
  totalMs: 0,
};

export function positionKey(stringIndex: number, fret: number): string {
  return `${stringIndex}:${fret}`;
}

/**
 * Higher weight = asked more often. Unseen positions get a fixed boost so new
 * ground gets covered; seen ones are weighted by (smoothed) miss rate and speed.
 */
function positionWeight(stat: PositionStat | undefined): number {
  if (!stat || stat.attempts === 0) return 3;
  const missRate = 1 - (stat.correct + 1) / (stat.attempts + 2);
  const slowness = Math.min(stat.avgMs / 4000, 2);
  return 0.5 + missRate * 8 + slowness;
}

function weightedPick<T>(items: T[], weightOf: (item: T) => number): T {
  const weights = items.map(weightOf);
  const total = weights.reduce((sum, w) => sum + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

type Pos = { string: number; fret: number };

/** Whether a position can be asked: enabled string, in the fret range and, with a key, in that key. */
function isInQuizScope(
  settings: QuizScope,
  tuning: string,
  string: number,
  fret: number,
): boolean {
  if (!settings.strings[string]) return false;
  if (fret < settings.minFret || fret > settings.maxFret) return false;
  if (settings.key == null) return true;
  const pc = NOTES.indexOf(getNoteAtPosition(string, fret, tuning));
  return keyPitchClasses(settings.key).includes(pc);
}

function buildQuestion(
  id: number,
  settings: QuizScope,
  tuning: string,
  stats: PositionStats,
  previous: Pos[],
): QuizQuestion | null {
  const pool: Pos[] = [];
  for (let s = 0; s < settings.strings.length; s++) {
    for (let f = settings.minFret; f <= settings.maxFret; f++) {
      if (isInQuizScope(settings, tuning, s, f)) pool.push({ string: s, fret: f });
    }
  }
  if (pool.length === 0) return null;

  const wanted = settings.mode === "group" ? settings.groupSize : 1;
  const weightOf = (p: Pos) =>
    positionWeight(stats[positionKey(p.string, p.fret)]);
  const wasPrevious = (p: Pos) =>
    previous.some((q) => q.string === p.string && q.fret === p.fret);

  // Never ask the exact same position(s) twice in a row, unless the pool is tiny.
  const freshPool = pool.filter((p) => !wasPrevious(p));
  const anchorPool = freshPool.length > 0 ? freshPool : pool;
  const anchor = weightedPick(anchorPool, weightOf);
  const picked: Pos[] = [anchor];

  if (wanted > 1) {
    // Keep the group inside one hand position around the anchor.
    let lo = anchor.fret - Math.floor(Math.random() * GROUP_SPAN_FRETS);
    lo = Math.min(lo, settings.maxFret - GROUP_SPAN_FRETS + 1);
    lo = Math.max(lo, settings.minFret);
    const hi = lo + GROUP_SPAN_FRETS - 1;
    let candidates = pool.filter(
      (p) => p.fret >= lo && p.fret <= hi && p !== anchor,
    );
    while (picked.length < wanted && candidates.length > 0) {
      const next = weightedPick(candidates, weightOf);
      picked.push(next);
      candidates = candidates.filter((p) => p !== next);
    }
  }

  // Read left to right, low string first within a fret.
  picked.sort((a, b) => a.fret - b.fret || b.string - a.string);

  return {
    id,
    targets: picked.map((p) => ({
      ...p,
      pc: NOTES.indexOf(getNoteAtPosition(p.string, p.fret, tuning)),
      answeredPc: null,
    })),
    activeIndex: 0,
    done: false,
  };
}

function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function sanitizeSettings(raw: Partial<QuizSettings> | null): QuizSettings {
  const s = { ...DEFAULT_QUIZ_SETTINGS, ...(raw ?? {}) };
  const clampFret = (n: unknown, fallback: number) =>
    typeof n === "number" && Number.isFinite(n)
      ? Math.min(QUIZ_MAX_FRET, Math.max(QUIZ_MIN_FRET, Math.round(n)))
      : fallback;
  const minFret = clampFret(s.minFret, DEFAULT_QUIZ_SETTINGS.minFret);
  const maxFret = Math.max(
    minFret,
    clampFret(s.maxFret, DEFAULT_QUIZ_SETTINGS.maxFret),
  );
  const strings =
    Array.isArray(s.strings) &&
    s.strings.length === 6 &&
    s.strings.some(Boolean)
      ? s.strings.map(Boolean)
      : DEFAULT_QUIZ_SETTINGS.strings;
  return {
    mode: s.mode === "group" ? "group" : "single",
    minFret,
    maxFret,
    strings,
    groupSize: Math.min(5, Math.max(2, clampFret(s.groupSize, 3))),
    key:
      typeof s.key === "number" && Number.isInteger(s.key) && s.key >= 0 && s.key < 12
        ? s.key
        : null,
  };
}

/** How long the answer stays on screen before the next question. */
function feedbackDelayMs(question: QuizQuestion): number {
  const allCorrect = question.targets.every((t) => t.answeredPc === t.pc);
  return allCorrect ? 700 : 2000;
}

export function useNoteQuiz(active: boolean, tuning: string) {
  const [settings, setSettingsState] = useState<QuizSettings>(
    DEFAULT_QUIZ_SETTINGS,
  );
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [allStats, setAllStats] = useState<Record<string, PositionStats>>({});
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [score, setScore] = useState<QuizScore>(EMPTY_SCORE);

  const allStatsRef = useRef(allStats);
  const questionRef = useRef(question);
  useEffect(() => {
    allStatsRef.current = allStats;
  }, [allStats]);
  useEffect(() => {
    questionRef.current = question;
  }, [question]);
  const targetStartRef = useRef(0);
  const nextIdRef = useRef(1);

  const stats = allStats[tuning] ?? {};

  useEffect(() => {
    setSettingsState(
      sanitizeSettings(readJson<Partial<QuizSettings>>(SETTINGS_KEY)),
    );
    setAllStats(readJson<Record<string, PositionStats>>(STATS_KEY) ?? {});
    setSettingsLoaded(true);
  }, []);

  const setSettings = useCallback((update: Partial<QuizSettings>) => {
    setSettingsState((prev) => {
      const next = sanitizeSettings({ ...prev, ...update });
      writeJson(SETTINGS_KEY, next);
      return next;
    });
  }, []);

  // Keyed by value, so re-saving unchanged settings doesn't throw away the
  // current question.
  const { mode, minFret, maxFret, strings, groupSize, key } = settings;
  const scopeKey = JSON.stringify({
    mode,
    minFret,
    maxFret,
    strings,
    groupSize,
    key,
  });
  const scope = useMemo(() => JSON.parse(scopeKey) as QuizScope, [scopeKey]);

  const nextQuestion = useCallback(() => {
    const previous = questionRef.current?.targets ?? [];
    const q = buildQuestion(
      nextIdRef.current++,
      scope,
      tuning,
      allStatsRef.current[tuning] ?? {},
      previous,
    );
    targetStartRef.current = performance.now();
    questionRef.current = q;
    setQuestion(q);
  }, [scope, tuning]);

  // New question whenever the quiz starts or its scope changes.
  useEffect(() => {
    if (!active || !settingsLoaded) {
      setQuestion(null);
      return;
    }
    nextQuestion();
  }, [active, settingsLoaded, nextQuestion]);

  useEffect(() => {
    if (!active) setScore(EMPTY_SCORE);
  }, [active]);

  // Auto-advance after showing feedback.
  useEffect(() => {
    if (!question?.done) return;
    const timer = window.setTimeout(nextQuestion, feedbackDelayMs(question));
    return () => window.clearTimeout(timer);
  }, [question, nextQuestion]);

  const submit = useCallback(
    (pc: number) => {
      const q = questionRef.current;
      if (!q || q.done) return;
      const target = q.targets[q.activeIndex];
      const correct = pc === target.pc;
      const now = performance.now();
      const ms = Math.min(now - targetStartRef.current, MAX_COUNTED_MS);
      targetStartRef.current = now;

      const key = positionKey(target.string, target.fret);
      setAllStats((prev) => {
        const tuningStats = prev[tuning] ?? {};
        const old = tuningStats[key];
        const updated: PositionStat = old
          ? {
              attempts: old.attempts + 1,
              correct: old.correct + (correct ? 1 : 0),
              avgMs: old.avgMs + AVG_MS_ALPHA * (ms - old.avgMs),
            }
          : { attempts: 1, correct: correct ? 1 : 0, avgMs: ms };
        const next = { ...prev, [tuning]: { ...tuningStats, [key]: updated } };
        writeJson(STATS_KEY, next);
        return next;
      });

      setScore((prev) => {
        const streak = correct ? prev.streak + 1 : 0;
        return {
          correct: prev.correct + (correct ? 1 : 0),
          total: prev.total + 1,
          streak,
          bestStreak: Math.max(prev.bestStreak, streak),
          totalMs: prev.totalMs + ms,
        };
      });

      const targets = q.targets.map((t, i) =>
        i === q.activeIndex ? { ...t, answeredPc: pc } : t,
      );
      const activeIndex = q.activeIndex + 1;
      const updatedQuestion = {
        ...q,
        targets,
        activeIndex,
        done: activeIndex >= targets.length,
      };
      questionRef.current = updatedQuestion;
      setQuestion(updatedQuestion);
    },
    [tuning],
  );

  const resetStats = useCallback(() => {
    setAllStats((prev) => {
      const next = { ...prev };
      delete next[tuning];
      writeJson(STATS_KEY, next);
      return next;
    });
  }, [tuning]);

  const isInScope = useCallback(
    (string: number, fret: number) =>
      isInQuizScope(settings, tuning, string, fret),
    [settings, tuning],
  );

  return {
    settings,
    setSettings,
    isInScope,
    question,
    score,
    stats,
    submit,
    skip: nextQuestion,
    resetStats,
  };
}

export type NoteQuiz = ReturnType<typeof useNoteQuiz>;
