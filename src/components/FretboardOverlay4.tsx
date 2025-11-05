"use client";

import { useState, useEffect } from "react";
import * as styles from "./FretboardOverlay4.css";

interface FretboardOverlay4Props {
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

// Generate a 5x1 grid showing notes relative to the center position
function generateFourthGrid(
  centerString: number,
  centerFret: number,
): { note: string; visible: boolean; isCenter: boolean }[][] {
  const grid: { note: string; visible: boolean; isCenter: boolean }[][] = [];

  // The visual positioning is: offsetX = 3 * cellWidth, offsetY = -3 * cellHeight
  // This means the overlay appears 1.5 cells right and 1 string up
  // Position on the B string (index 1) relative to center
  const gridStartString = centerString - 1; // Move up 1 string from center
  const gridStartFret = centerFret - 2; // Start 2 frets before center for 5-fret span

  // Create 1 row (string), 5 columns (frets)
  for (let row = 0; row < 1; row++) {
    const noteRow: { note: string; visible: boolean; isCenter: boolean }[] = [];
    for (let col = 0; col < 5; col++) {
      // Calculate absolute position on fretboard
      const targetString = gridStartString + row;
      const targetFret = gridStartFret + col;

      // Highlight the center fret (the one being hovered)
      const isConnectingNote = col === 2; // Middle column is the hovered fret

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
        // Show empty cell for out-of-bounds positions
        noteRow.push({ note: "", visible: true, isCenter: false });
      }
    }
    grid.push(noteRow);
  }

  return grid;
}

export default function FretboardOverlay4({
  isVisible,
  mousePosition,
  snappedPosition,
  hoveredFret,
}: FretboardOverlay4Props) {
  const [noteGrid, setNoteGrid] = useState<
    { note: string; visible: boolean; isCenter: boolean }[][]
  >([]);

  // Update note grid based on hovered fret position
  useEffect(() => {
    if (hoveredFret) {
      const grid = generateFourthGrid(hoveredFret.string, hoveredFret.fret);
      setNoteGrid(grid);
    } else {
      // Show a default grid when not hovering
      setNoteGrid([]);
    }
  }, [hoveredFret]);

  const position = snappedPosition || mousePosition;

  // Use standard 16px font size for rem calculations (most browsers default)
  // This provides better alignment than hardcoded pixel values
  const rootFontSize = 16;
  const cellWidth = 2.5 * rootFontSize; // 2.5rem = 40px
  const cellHeight = 3 * rootFontSize; // 3rem = 48px

  // Position overlay on the B string (second row from top)
  const offsetX = 3 * cellWidth; // No horizontal offset to align with actual fret position
  const offsetY = -3 * cellHeight; // Move down 1 string to B string position

  // Force visibility for debugging
  const isOverlayVisible = isVisible && hoveredFret !== null;

  return (
    <div
      className={`${styles.overlay} ${isOverlayVisible ? styles.visible : styles.hidden}`}
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
