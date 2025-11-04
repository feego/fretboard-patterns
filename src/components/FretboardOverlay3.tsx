"use client";

import { useState, useEffect } from "react";
import * as styles from "./FretboardOverlay3.css";

interface FretboardOverlay3Props {
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

// Generate a 5x1 grid showing the string 2 positions down from the hovered fret
function generateThirdGrid(centerString: number, centerFret: number): { note: string; visible: boolean; isCenter: boolean }[][] {
  const grid: { note: string; visible: boolean; isCenter: boolean }[][] = [];
  
  // The visual positioning is: offsetX = 5 * cellWidth, offsetY = -4 * cellHeight
  // Each cell is 40px wide × 48px tall
  // offsetX = 5 * 40px = 200px right from hover center
  // offsetY = -4 * 48px = -192px up from hover center
  // 
  // The overlay has transform: translate(-50%, -50%) so its center is at the offset position
  // The overlay is 5×1 = 200px wide × 48px tall, so its center is at 100px from left edge
  // 
  // If the overlay center is 200px right and 192px up from hover center:
  // - The overlay's left edge is at (hover center + 200px - 100px) = hover center + 100px
  // - This means the overlay starts 100px (2.5 cells) to the right of hover center
  // - The overlay center is 192px up (4 strings up) from hover center
  
  let gridStartString = centerString; // Move UP 4 strings to match visual positioning
  let gridStartFret = centerFret - 2; // Start 2 frets before center (since overlay is 5 frets wide and its center is 2.5 frets right)
  
  // Clamp string to valid range
  if (gridStartString < 0) {
    gridStartString = 0; // High E string (first string)
  }
  
  // Always create 1 row (string), 5 columns (frets)
  for (let row = 0; row < 1; row++) {
    const noteRow: { note: string; visible: boolean; isCenter: boolean }[] = [];
    for (let col = 0; col < 5; col++) {
      // Calculate absolute position on fretboard
      const targetString = gridStartString + row;
      const targetFret = gridStartFret + col;
      
      // No center highlighting since this is offset
      const isConnectingNote = false;
      
      // Check bounds - if out of bounds, show empty but still create the cell
      if (targetString >= 0 && targetString < 6 && targetFret >= 0 && targetFret <= 24) {
        const note = getNoteAtPosition(targetString, targetFret);
        noteRow.push({ note, visible: true, isCenter: isConnectingNote });
      } else {
        // Show empty cell for out-of-bounds positions
        noteRow.push({ note: "", visible: false, isCenter: false });
      }
    }
    grid.push(noteRow);
  }
  
  return grid;
}

export default function FretboardOverlay3({ 
  isVisible, 
  mousePosition, 
  snappedPosition,
  hoveredFret
}: FretboardOverlay3Props) {
  const [noteGrid, setNoteGrid] = useState<{ note: string; visible: boolean; isCenter: boolean }[][]>([]);
  
  // Update note grid based on hovered fret position
  useEffect(() => {
    if (hoveredFret) {
      const grid = generateThirdGrid(hoveredFret.string, hoveredFret.fret);
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
  
  // Position overlay 2 frets to the right and 2 strings down from the hovered fret
  const offsetX = 5 * cellWidth; // Move right by 2 cells (2 frets)
  const offsetY = -4 * cellHeight; // Move down by 2 strings
  
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
                className={`${styles.gridCell} ${cell.isCenter ? styles.centerCell : ""} ${!cell.visible ? styles.emptyCell : ""} ${cell.visible && cell.note.includes('#') ? styles.sharpNote : ""}`}
              >
                {cell.visible ? cell.note : ""}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}