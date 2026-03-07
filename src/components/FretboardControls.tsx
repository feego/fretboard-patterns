"use client";

import { useEffect, useRef, useState } from "react";
import * as styles from "./FretboardControls.css";


interface FretboardControlsProps {
  showDimmedNotes: boolean;
  onToggleDimmedNotes: () => void;
  tuning: string;
  onTuningChange: (tuning: string) => void;
  showDegrees: boolean;
  onToggleDegrees: () => void;
  onSelectCagedNotes: () => void;
  onClearSelectedNotes: () => void;
}

export default function FretboardControls({
  showDimmedNotes,
  onToggleDimmedNotes,
  tuning,
  onTuningChange,
  showDegrees,
  onToggleDegrees,
  onSelectCagedNotes,
  onClearSelectedNotes,
}: FretboardControlsProps) {
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

  const stopMetronome = () => {
    if (intervalIdRef.current != null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    setMetronomeOn(false);
  };

  const scheduleClick = (
    ctx: AudioContext,
    time: number,
    isAccent: boolean,
  ) => {
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
  };

  const startMetronome = async () => {
    if (metronomeOn) return;

    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
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
      // If resume fails (rare), just don't start.
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
  };

  useEffect(() => {
    return () => {
      if (intervalIdRef.current != null) {
        window.clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, []);

  const tuningOptions = [
    { value: "standard", label: "Standard (E-A-D-G-B-E)" },
    { value: "allFourths", label: "All Fourths (E-A-D-G-C-F)" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <button
          type="button"
          className={styles.button}
          onClick={metronomeOn ? stopMetronome : startMetronome}
        >
          {metronomeOn ? "Stop" : "Start"} Metronome
        </button>

        <div className={styles.selectWrapper}>
          <label className={styles.label} htmlFor="bpm-input">
            BPM:
          </label>
          <input
            id="bpm-input"
            className={styles.input}
            type="number"
            min={30}
            max={300}
            step={1}
            value={bpm}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (!Number.isFinite(next)) return;
              setBpm(Math.max(30, Math.min(300, next)));
            }}
          />
        </div>
      </div>

      <div className={styles.row}>
        <button
          type="button"
          className={styles.button}
          onClick={onToggleDimmedNotes}
        >
          {showDimmedNotes ? "Hide" : "Show"} Dimmed Notes
        </button>

        <button
          type="button"
          className={styles.button}
          onClick={onToggleDegrees}
        >
          {showDegrees ? "Show Note Names" : "Show Scale Degrees"}
        </button>

        <div className={styles.selectWrapper}>
          <label className={styles.label} htmlFor="tuning-select">
            Tuning:
          </label>
          <select
            id="tuning-select"
            className={styles.select}
            value={tuning}
            onChange={(e) => onTuningChange(e.target.value)}
          >
            {tuningOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <button
          type="button"
          className={styles.button}
          onClick={onSelectCagedNotes}
        >
          Select CAGED Notes
        </button>

        <button
          type="button"
          className={styles.button}
          onClick={onClearSelectedNotes}
        >
          Clear Selected Notes
        </button>
      </div>
    </div>
  );
}
