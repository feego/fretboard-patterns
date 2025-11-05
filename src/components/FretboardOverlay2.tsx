"use client";

import { useState, useEffect } from "react";
import * as styles from "./FretboardOverlay2.css";

interface FretboardOverlay2Props {
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

// Generate a 5x2 grid of notes, positioned so that the bottom-left note
// of this grid matches the top-center note of the first overlay
function generateSecondGrid(
  centerString: number,
  centerFret: number,
): { note: string; visible: boolean; isCenter: boolean }[][] {
  const grid: { note: string; visible: boolean; isCenter: boolean }[][] = [];

  // First overlay grid logic (for reference):
  // - 3 rows: centerString + (-1, 0, 1) = strings centerString-1, centerString, centerString+1
  // - 5 cols: centerFret + (-2, -1, 0, 1, 2) = frets centerFret-2 to centerFret+2
  // - Top-center (row 0, col 2): (centerString-1, centerFret+0) = (centerString-1, centerFret)

  // Second overlay: bottom-left should match first overlay's top-center
  // Bottom-left of second grid = row 1, col 0 (in a 2-row grid)
  // If (row 1, col 0) should be at (centerString-1, centerFret), then:
  // Grid start = (centerString-1-1, centerFret-0) = (centerString-2, centerFret)

  const gridStartString = centerString - 2;
  const gridStartFret = centerFret;

  // Create 2 rows (strings), 5 columns (frets)
  for (let row = 0; row < 2; row++) {
    const noteRow: { note: string; visible: boolean; isCenter: boolean }[] = [];
    for (let col = 0; col < 5; col++) {
      // Calculate absolute position on fretboard
      const targetString = gridStartString + row;
      const targetFret = gridStartFret + col;

      // Highlight the connecting note (bottom-left of this grid)
      const isConnectingNote = row === 1 && col === 0;

      // Check bounds
      if (
        targetString >= 0 &&
        targetString < 6 &&
        targetFret >= 0 &&
        targetFret <= 24
      ) {
        const note = getNoteAtPosition(targetString, targetFret);
        noteRow.push({ note, visible: true, isCenter: isConnectingNote });
      } else {
        noteRow.push({ note: "", visible: false, isCenter: false });
      }
    }
    grid.push(noteRow);
  }

  return grid;
}

export default function FretboardOverlay2({
  isVisible,
  mousePosition,
  snappedPosition,
  hoveredFret,
}: FretboardOverlay2Props) {
  const [noteGrid, setNoteGrid] = useState<
    { note: string; visible: boolean; isCenter: boolean }[][]
  >([]);

  // Update note grid based on hovered fret position
  useEffect(() => {
    if (hoveredFret) {
      const grid = generateSecondGrid(hoveredFret.string, hoveredFret.fret);
      setNoteGrid(grid);
    } else {
      // Default grid when not hovering over a specific fret
      setNoteGrid([]);
    }
  }, [hoveredFret]);

  const position = snappedPosition || mousePosition;

  // Position the 2nd overlay (5x2 green grid) to connect with the 1st overlay
  // First overlay is 5x3 centered at mouse position
  // Position this 5x2 overlay so its bottom edge aligns with first overlay's top edge
  const rootFontSize = 16;
  const cellWidth = 2.5 * rootFontSize; // 2.5rem = 40px
  const cellHeight = 3 * rootFontSize; // 3rem = 48px
  const offsetX = 2 * cellWidth; // Move right by 2 cells
  const offsetY = -1.5 * cellHeight; // Move up by 2.5 cells (1.5 for first overlay + 1 for this overlay's height)

  return (
    <div
      className={`${styles.overlay} ${isVisible && noteGrid.length > 0 ? styles.visible : styles.hidden}`}
      style={{
        left: position.x + offsetX,
        top: position.y + offsetY,
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
