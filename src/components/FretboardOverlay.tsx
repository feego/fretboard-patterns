"use client";

import { useState, useEffect } from "react";
import * as styles from "./FretboardOverlay.css";

interface FretboardOverlayProps {
  isVisible: boolean;
  mousePosition: { x: number; y: number };
  snappedPosition: { x: number; y: number } | null;
  hoveredFret: { string: number; fret: number } | null;
}

const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Standard guitar tuning (from high E to low E - inverted to match visual layout)
const stringTuning = [
  { note: "E", octave: 4 }, // 1st string (high E) - now at top
  { note: "B", octave: 3 }, // 2nd string
  { note: "G", octave: 3 }, // 3rd string
  { note: "D", octave: 3 }, // 4th string
  { note: "A", octave: 2 }, // 5th string
  { note: "E", octave: 2 }, // 6th string (low E) - now at bottom
];

// Calculate the note at a specific string and fret
function getNoteAtPosition(stringIndex: number, fretNumber: number): string {
  const openString = stringTuning[stringIndex];
  const openNoteIndex = notes.indexOf(openString.note);
  const noteIndex = (openNoteIndex + fretNumber) % 12;
  return notes[noteIndex];
}

// Generate a simple 5x3 grid of notes around a center position
function generateSimpleGrid(
  centerString: number,
  centerFret: number,
): { note: string; visible: boolean; isCenter: boolean }[][] {
  const grid: { note: string; visible: boolean; isCenter: boolean }[][] = [];

  // Create 3 rows (strings), 5 columns (frets)
  for (let row = 0; row < 3; row++) {
    const noteRow: { note: string; visible: boolean; isCenter: boolean }[] = [];
    for (let col = 0; col < 5; col++) {
      const isCenter = row === 1 && col === 2; // Center of 3x5 grid

      // Calculate string and fret offset from center
      const stringOffset = row - 1; // -1, 0, 1
      const fretOffset = col - 2; // -2, -1, 0, 1, 2

      const targetString = centerString + stringOffset;
      const targetFret = centerFret + fretOffset;

      // Check bounds
      if (
        targetString >= 0 &&
        targetString < 6 &&
        targetFret >= 0 &&
        targetFret <= 24
      ) {
        const note = getNoteAtPosition(targetString, targetFret);
        noteRow.push({ note, visible: true, isCenter });
      } else {
        noteRow.push({ note: "", visible: false, isCenter: false });
      }
    }
    grid.push(noteRow);
  }

  return grid;
}

export default function FretboardOverlay({
  isVisible,
  mousePosition,
  snappedPosition,
  hoveredFret,
}: FretboardOverlayProps) {
  const [noteGrid, setNoteGrid] = useState<
    { note: string; visible: boolean; isCenter: boolean }[][]
  >([]);

  // Update note grid based on hovered fret position
  useEffect(() => {
    if (hoveredFret) {
      const grid = generateSimpleGrid(hoveredFret.string, hoveredFret.fret);
      setNoteGrid(grid);
    } else {
      // Default grid when not hovering over a specific fret
      setNoteGrid([]);
    }
  }, [hoveredFret]);

  const position = snappedPosition || mousePosition;

  return (
    <div
      className={`${styles.overlay} ${isVisible && noteGrid.length > 0 ? styles.visible : styles.hidden}`}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className={styles.grid}>
        {noteGrid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`${styles.gridCell} ${cell.isCenter ? styles.centerCell : ""} ${!cell.visible ? styles.emptyCell : ""} ${cell.visible && cell.note.includes("#") ? styles.sharpNote : ""}`}
              >
                {cell.visible ? cell.note : ""}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
