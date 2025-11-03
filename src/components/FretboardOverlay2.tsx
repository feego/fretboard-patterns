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

// Generate a simple 5x3 grid of notes, positioned so that the bottom-left note
// of this grid matches the top-center note of the first overlay
function generateSecondGrid(centerString: number, centerFret: number): { note: string; visible: boolean; isCenter: boolean }[][] {
  const grid: { note: string; visible: boolean; isCenter: boolean }[][] = [];
  
  // First overlay grid logic (for reference):
  // - 3 rows: centerString + (-1, 0, 1) = strings centerString-1, centerString, centerString+1
  // - 5 cols: centerFret + (-2, -1, 0, 1, 2) = frets centerFret-2 to centerFret+2
  // - Top-center (row 0, col 2): (centerString-1, centerFret+0) = (centerString-1, centerFret)
  
  // Second overlay: bottom-left should match first overlay's top-center
  // Bottom-left of second grid = row 2, col 0
  // If (row 2, col 0) should be at (centerString-1, centerFret), then:
  // Grid start = (centerString-1-2, centerFret-0) = (centerString-3, centerFret)
  
  const gridStartString = centerString - 3;
  const gridStartFret = centerFret;
  
  // Create 3 rows (strings), 5 columns (frets)
  for (let row = 0; row < 3; row++) {
    const noteRow: { note: string; visible: boolean; isCenter: boolean }[] = [];
    for (let col = 0; col < 5; col++) {
      // Calculate absolute position on fretboard
      const targetString = gridStartString + row;
      const targetFret = gridStartFret + col;
      
      // Highlight the connecting note (bottom-left of this grid)
      const isConnectingNote = (row === 2 && col === 0);
      
      // Check bounds
      if (targetString >= 0 && targetString < 6 && targetFret >= 0 && targetFret <= 24) {
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
  hoveredFret
}: FretboardOverlay2Props) {
  const [noteGrid, setNoteGrid] = useState<{ note: string; visible: boolean; isCenter: boolean }[][]>([]);
  
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
  
  // Offset position so that our bottom-left visually aligns with first overlay's top-center
  // First overlay is centered at mouse position
  // First overlay's top-center is visually at: 1 cell up, 0 cells offset from center
  // Second overlay's bottom-left should align there, which means:
  // Second overlay center should be: 1 cell up + 1 cell up (to center of our 3-cell height) = 2 cells up
  // And: 0 cells + 2 cells right (to center of our 5-cell width) = 2 cells right
  const cellWidth = 40; // CSS: 2.5rem = 40px
  const cellHeight = 48; // CSS: 3rem = 48px  
  const offsetX = 2 * cellWidth; // Move right by 2 cells
  const offsetY = -2 * cellHeight; // Move up by 2 cells
  
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