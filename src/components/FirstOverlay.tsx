"use client";

import { useState, useEffect } from "react";
import * as styles from "./FirstOverlay.css";

interface FirstOverlayProps {
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
  // Wrap fret number to keep it within valid range for note calculation
  // Handle negative numbers properly
  let wrappedFret = ((fretNumber - 1) % 24) + 1;
  if (wrappedFret <= 0) wrappedFret += 24;
  const noteIndex = (openNoteIndex + wrappedFret) % 12;
  return notes[noteIndex];
}

// Generate a simple 5x3 grid of notes around a center position (main overlay)
function generateMainGrid(centerString: number, centerFret: number): { note: string; visible: boolean; isCenter: boolean }[][] {
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
      
      // Check bounds (only check string bounds, allow fret wrapping)
      if (targetString >= 0 && targetString < 6) {
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

// Generate a 5x2 grid connected to the main overlay (second overlay)
function generateSecondGrid(centerString: number, centerFret: number): { note: string; visible: boolean; isCenter: boolean }[][] {
  const grid: { note: string; visible: boolean; isCenter: boolean }[][] = [];
  
  const gridStartString = centerString - 2;
  const gridStartFret = centerFret;
  
  // Create 2 rows (strings), 5 columns (frets)
  for (let row = 0; row < 2; row++) {
    const noteRow: { note: string; visible: boolean; isCenter: boolean }[] = [];
    for (let col = 0; col < 5; col++) {
      const targetString = gridStartString + row;
      const targetFret = gridStartFret + col;
      
      const isConnectingNote = (row === 1 && col === 0);
      
      if (targetString >= 0 && targetString < 6) {
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

// Generate a 5x1 grid (third overlay)
function generateThirdGrid(centerString: number, centerFret: number): { note: string; visible: boolean; isCenter: boolean }[][] {
  const grid: { note: string; visible: boolean; isCenter: boolean }[][] = [];
  
  // The third overlay is positioned at +5 cellWidth (right) and -4 cellHeight (up)
  // Trial and error approach: if it should show E on 12th fret when hovering on a specific fret,
  // let's try different offset values to get it right
  let gridStartString = centerString - 4; // Move UP 4 strings
  const gridStartFret = centerFret + 3; // Try +3 frets to get the right alignment
  
  if (gridStartString < 0) {
    gridStartString = 0;
  }
  
  for (let row = 0; row < 1; row++) {
    const noteRow: { note: string; visible: boolean; isCenter: boolean }[] = [];
    for (let col = 0; col < 5; col++) {
      const targetString = gridStartString + row;
      const targetFret = gridStartFret + col;
      
      const isConnectingNote = false;
      
      if (targetString >= 0 && targetString < 6) {
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

// Generate a 7x1 grid (fourth overlay)
function generateFourthGrid(centerString: number, centerFret: number): { note: string; visible: boolean; isCenter: boolean }[][] {
  const grid: { note: string; visible: boolean; isCenter: boolean }[][] = [];
  
  const gridStartString = centerString - 1;
  const gridStartFret = centerFret - 2;
  
  for (let row = 0; row < 1; row++) {
    const noteRow: { note: string; visible: boolean; isCenter: boolean }[] = [];
    for (let col = 0; col < 7; col++) {
      const targetString = gridStartString + row;
      const targetFret = gridStartFret + col;
      
      // Alternate pattern: highlighted on columns 0, 2, 4, 6 (odd positions)
      const isHighlighted = col % 2 === 0;
      
      if (targetString >= 0 && targetString < 6) {
        const note = getNoteAtPosition(targetString, targetFret);
        noteRow.push({ note, visible: true, isCenter: isHighlighted });
      } else {
        noteRow.push({ note: "", visible: false, isCenter: false });
      }
    }
    grid.push(noteRow);
  }
  
  return grid;
}

// Generate a 7x1 grid (fifth overlay - bottom)
function generateFifthGrid(centerString: number, centerFret: number): { note: string; visible: boolean; isCenter: boolean }[][] {
  const grid: { note: string; visible: boolean; isCenter: boolean }[][] = [];
  
  const gridStartString = centerString + 1;
  const gridStartFret = centerFret - 4;
  
  for (let row = 0; row < 1; row++) {
    const noteRow: { note: string; visible: boolean; isCenter: boolean }[] = [];
    for (let col = 0; col < 7; col++) {
      const targetString = gridStartString + row;
      const targetFret = gridStartFret + col;
      
      // Alternate pattern: highlighted on columns 0, 2, 4, 6 (odd positions)
      const isHighlighted = col % 2 === 0;
      
      if (targetString >= 0 && targetString < 6) {
        const note = getNoteAtPosition(targetString, targetFret);
        noteRow.push({ note, visible: true, isCenter: isHighlighted });
      } else {
        noteRow.push({ note: "", visible: false, isCenter: false });
      }
    }
    grid.push(noteRow);
  }
  
  return grid;
}

export default function FirstOverlay({ 
  isVisible, 
  mousePosition, 
  snappedPosition,
  hoveredFret
}: FirstOverlayProps) {
  const [mainGrid, setMainGrid] = useState<{ note: string; visible: boolean; isCenter: boolean }[][]>([]);
  const [secondGrid, setSecondGrid] = useState<{ note: string; visible: boolean; isCenter: boolean }[][]>([]);
  const [thirdGrid, setThirdGrid] = useState<{ note: string; visible: boolean; isCenter: boolean }[][]>([]);
  const [fourthGrid, setFourthGrid] = useState<{ note: string; visible: boolean; isCenter: boolean }[][]>([]);
  const [fifthGrid, setFifthGrid] = useState<{ note: string; visible: boolean; isCenter: boolean }[][]>([]);
  
  // Update note grids based on hovered fret position
  useEffect(() => {
    if (hoveredFret) {
      setMainGrid(generateMainGrid(hoveredFret.string, hoveredFret.fret));
      setSecondGrid(generateSecondGrid(hoveredFret.string, hoveredFret.fret));
      setThirdGrid(generateThirdGrid(hoveredFret.string, hoveredFret.fret));
      setFourthGrid(generateFourthGrid(hoveredFret.string, hoveredFret.fret));
      setFifthGrid(generateFifthGrid(hoveredFret.string, hoveredFret.fret));
    } else {
      setMainGrid([]);
      setSecondGrid([]);
      setThirdGrid([]);
      setFourthGrid([]);
      setFifthGrid([]);
    }
  }, [hoveredFret]);
  
  const position = snappedPosition || mousePosition;
  
  const rootFontSize = 16;
  const cellWidth = 4 * rootFontSize; // Updated from 2.5 to 4
  const cellHeight = 3 * rootFontSize;
  
  return (
    <>
      {/* Main Overlay (5x3 grid) */}
      <div
        className={`${styles.overlay} ${isVisible && mainGrid.length > 0 ? styles.visible : styles.hidden}`}
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div className={styles.mainGrid}>
          {mainGrid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isHighlighted = colIndex === 0 || colIndex === 2 || colIndex === 4; // Left, center, right columns
              return (
                <div
                  key={`main-${rowIndex}-${colIndex}`}
                  className={`${styles.gridCell} ${cell.isCenter ? styles.centerCell : ""} ${!cell.visible ? styles.emptyCell : ""} ${cell.visible ? (isHighlighted ? styles.highlightedNote : styles.dimmedNote) : ""}`}
                >
                  {cell.visible ? cell.note : ""}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Second Overlay (5x2 grid) */}
      <div
        className={`${styles.overlay} ${isVisible && secondGrid.length > 0 ? styles.visible : styles.hidden}`}
        style={{
          left: position.x + 2 * cellWidth,
          top: position.y - 1.5 * cellHeight,
        }}
      >
        <div className={styles.secondGrid}>
          {secondGrid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isHighlighted = colIndex === 0 || colIndex === 2 || colIndex === 4; // Left, center, right columns
              return (
                <div
                  key={`second-${rowIndex}-${colIndex}`}
                  className={`${styles.gridCell} ${rowIndex === 1 ? styles.secondGridSecondRow : ""} ${cell.isCenter ? styles.centerCell : ""} ${!cell.visible ? styles.emptyCell : ""} ${cell.visible ? (isHighlighted ? styles.highlightedNote : styles.dimmedNote) : ""}`}
                >
                  {cell.visible ? cell.note : ""}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Third Overlay (5x1 grid) */}
      <div
        className={`${styles.overlay} ${isVisible && thirdGrid.length > 0 ? styles.visible : styles.hidden}`}
        style={{
          left: position.x + 5 * cellWidth,
          top: position.y - 4 * cellHeight,
        }}
      >
        <div className={styles.thirdGrid}>
          {thirdGrid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isHighlighted = colIndex === 0 || colIndex === 2 || colIndex === 4; // Left, center, right columns
              return (
                <div
                  key={`third-${rowIndex}-${colIndex}`}
                  className={`${styles.gridCell} ${cell.isCenter ? styles.centerCell : ""} ${!cell.visible ? styles.emptyCell : ""} ${cell.visible ? (isHighlighted ? styles.highlightedNote : styles.dimmedNote) : ""}`}
                >
                  {cell.visible ? cell.note : ""}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Fourth Overlay (7x1 grid) */}
      <div
        className={`${styles.overlay} ${isVisible && fourthGrid.length > 0 ? styles.visible : styles.hidden}`}
        style={{
          left: position.x + 4 * cellWidth,
          top: position.y - 3 * cellHeight,
        }}
      >
        <div className={styles.fourthGrid}>
          {fourthGrid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              return (
                <div
                  key={`fourth-${rowIndex}-${colIndex}`}
                  className={`${styles.gridCell} ${cell.isCenter ? styles.centerCell : ""} ${!cell.visible ? styles.emptyCell : ""} ${cell.visible ? (cell.isCenter ? styles.highlightedNote : styles.dimmedNote) : ""}`}
                >
                  {cell.visible ? cell.note : ""}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Fifth Overlay (7x1 grid - bottom) */}
      <div
        className={`${styles.overlayBottom} ${isVisible && fifthGrid.length > 0 ? styles.visible : styles.hidden}`}
        style={{
          left: position.x + -1 * cellWidth,
          top: position.y + 1 * cellHeight,
        }}
      >
        <div className={styles.fifthGrid}>
          {fifthGrid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              return (
                <div
                  key={`fifth-${rowIndex}-${colIndex}`}
                  className={`${styles.gridCell} ${cell.isCenter ? styles.centerCell : ""} ${!cell.visible ? styles.emptyCell : ""} ${cell.visible ? (cell.isCenter ? styles.highlightedNote : styles.dimmedNote) : ""}`}
                >
                  {cell.visible ? cell.note : ""}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
