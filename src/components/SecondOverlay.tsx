"use client";

import { useState, useEffect } from "react";
import * as styles from "./SecondOverlay.css";

interface SecondOverlayProps {
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

// Generate a 5x3 grid (main grid for SecondOverlay)
function generateMainGrid(centerString: number, centerFret: number): { note: string; visible: boolean; isCenter: boolean }[][] {
  const grid: { note: string; visible: boolean; isCenter: boolean }[][] = [];
  
  // This grid is visually positioned 7 frets right and 1 string up
  // Adjust the center accordingly
  const visualCenterString = centerString - 1; // 1 string up (toward higher strings)
  const visualCenterFret = centerFret + 7; // 7 frets right
  
  // Create 3 rows (strings), 5 columns (frets) around the visual center
  for (let row = 0; row < 3; row++) {
    const noteRow: { note: string; visible: boolean; isCenter: boolean }[] = [];
    for (let col = 0; col < 5; col++) {
      const isCenter = (row === 1 && col === 2); // Center of 3x5 grid
      
      // Calculate string and fret offset from visual center
      const stringOffset = row - 1; // -1, 0, 1 for 3 rows centered around visual center
      const fretOffset = col - 2; // -2, -1, 0, 1, 2 for 5 columns centered around visual center
      
      const targetString = visualCenterString + stringOffset;
      const targetFret = visualCenterFret + fretOffset;
      
      // Check bounds
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

// Generate top 7x1 grid
function generateTopGrid(centerString: number, centerFret: number): { note: string; visible: boolean; isCenter: boolean }[][] {
  const grid: { note: string; visible: boolean; isCenter: boolean }[][] = [];
  
  // This grid is visually positioned 11 frets right and 4 strings up
  const visualCenterString = centerString - 4;
  const visualCenterFret = centerFret + 11;
  
  // Create 1 row (string), 7 columns (frets) around the visual center
  const noteRow: { note: string; visible: boolean; isCenter: boolean }[] = [];
  for (let col = 0; col < 7; col++) {
    // Alternate pattern: highlighted on columns 0, 2, 4, 6 (odd positions)
    const isHighlighted = col % 2 === 0;
    
    // Calculate fret offset from visual center
    const fretOffset = col - 3; // -3, -2, -1, 0, 1, 2, 3 for 7 columns centered around visual center
    
    const targetString = visualCenterString;
    const targetFret = visualCenterFret + fretOffset;
    
    // Check bounds
    if (targetString >= 0 && targetString < 6) {
      const note = getNoteAtPosition(targetString, targetFret);
      noteRow.push({ note, visible: true, isCenter: isHighlighted });
    } else {
      noteRow.push({ note: "", visible: false, isCenter: false });
    }
  }
  grid.push(noteRow);
  
  return grid;
}

// Generate top bottom 5x2 grid (positioned below top 7x1)
function generateTopGridBottom(centerString: number, centerFret: number): { note: string; visible: boolean; isCenter: boolean }[][] {
  const grid: { note: string; visible: boolean; isCenter: boolean }[][] = [];
  
  // This grid is visually positioned 10 frets right and 3 strings up (1 string below the 7x1)
  const visualCenterString = centerString - 3;
  const visualCenterFret = centerFret + 10;
  
  // Create 2 rows (strings), 5 columns (frets) around the visual center
  for (let row = 0; row < 2; row++) {
    const noteRow: { note: string; visible: boolean; isCenter: boolean }[] = [];
    for (let col = 0; col < 5; col++) {
      const isCenter = (row === 0 && col === 2); // Center of 2x5 grid
      
      // Calculate string and fret offset from visual center
      const stringOffset = row - 0.5; // -0.5, 0.5 for 2 rows centered around visual center
      const fretOffset = col - 2; // -2, -1, 0, 1, 2 for 5 columns centered around visual center
      
      const targetString = Math.round(visualCenterString + stringOffset);
      const targetFret = visualCenterFret + fretOffset;
      
      // Check bounds
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

// Generate second 5x2 grid (positioned below main grid)
function generateBottomGrid(centerString: number, centerFret: number): { note: string; visible: boolean; isCenter: boolean }[][] {
  const grid: { note: string; visible: boolean; isCenter: boolean }[][] = [];
  
  // This grid is visually positioned 5 frets right and 1 string down
  // Adjust the center accordingly
  const visualCenterString = centerString; // 1 string down (toward lower strings)
  const visualCenterFret = centerFret + 5; // 5 frets right
  
  // Create 2 rows (strings), 5 columns (frets) around the visual center
  for (let row = 0; row < 2; row++) {
    const noteRow: { note: string; visible: boolean; isCenter: boolean }[] = [];
    for (let col = 0; col < 5; col++) {
      const isCenter = (row === 0 && col === 2); // Center of 2x5 grid
      
      // Calculate string and fret offset from visual center
      const stringOffset = row - 0.5; // -0.5, 0.5 for 2 rows centered around visual center
      const fretOffset = col - 2; // -2, -1, 0, 1, 2 for 5 columns centered around visual center
      
      const targetString = Math.round(visualCenterString + stringOffset);
      const targetFret = visualCenterFret + fretOffset;
      
      // Check bounds
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
export default function SecondOverlay({ 
  isVisible, 
  mousePosition, 
  snappedPosition,
  hoveredFret
}: SecondOverlayProps) {
  const [mainGrid, setMainGrid] = useState<{ note: string; visible: boolean; isCenter: boolean }[][]>([]);
  const [topGrid, setTopGrid] = useState<{ note: string; visible: boolean; isCenter: boolean }[][]>([]);
  const [topGridBottom, setTopGridBottom] = useState<{ note: string; visible: boolean; isCenter: boolean }[][]>([]);
  const [bottomGrid, setBottomGrid] = useState<{ note: string; visible: boolean; isCenter: boolean }[][]>([]);
  
  // Update note grids based on hovered fret position
  useEffect(() => {
    if (hoveredFret) {
      setMainGrid(generateMainGrid(hoveredFret.string, hoveredFret.fret));
      setTopGrid(generateTopGrid(hoveredFret.string, hoveredFret.fret));
      setTopGridBottom(generateTopGridBottom(hoveredFret.string, hoveredFret.fret));
      setBottomGrid(generateBottomGrid(hoveredFret.string, hoveredFret.fret));
    } else {
      setMainGrid([]);
      setTopGrid([]);
      setTopGridBottom([]);
      setBottomGrid([]);
    }
  }, [hoveredFret]);
  
  const position = snappedPosition || mousePosition;
  
  const rootFontSize = 16;
  const cellWidth = 4 * rootFontSize; // Updated from 2.5 to 4
  const cellHeight = 3 * rootFontSize;
  
  return (
    <>
      {/* Top Grid 7x1 */}
      <div
        className={`${styles.overlay} ${isVisible && topGrid.length > 0 ? styles.visible : styles.hidden}`}
        style={{
          left: position.x + 11 * cellWidth, // 11 frets to the right
          top: position.y - 4 * cellHeight, // 4 strings up
        }}
      >
        <div className={styles.topGrid}>
          {topGrid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              return (
                <div
                  key={`top-${rowIndex}-${colIndex}`}
                  className={`${styles.gridCell} ${cell.isCenter ? styles.centerCell : ""} ${!cell.visible ? styles.emptyCell : ""} ${cell.visible ? (cell.isCenter ? styles.highlightedNote : styles.dimmedNote) : ""}`}
                >
                  {cell.visible ? cell.note : ""}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Top Grid Bottom 5x2 */}
      <div
        className={`${styles.overlay} ${isVisible && topGridBottom.length > 0 ? styles.visible : styles.hidden}`}
        style={{
          left: position.x + 10 * cellWidth, // 10 frets to the right
          top: position.y - 2.5 * cellHeight, // 3 strings up - 0.5 for 2-row grid center
        }}
      >
        <div className={styles.topGridBottom}>
          {topGridBottom.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isHighlighted = colIndex === 0 || colIndex === 2 || colIndex === 4; // Left, center, right columns
              return (
                <div
                  key={`top-bottom-${rowIndex}-${colIndex}`}
                  className={`${styles.gridCell} ${cell.isCenter ? styles.centerCell : ""} ${!cell.visible ? styles.emptyCell : ""} ${cell.visible ? (isHighlighted ? styles.highlightedNote : styles.dimmedNote) : ""}`}
                >
                  {cell.visible ? cell.note : ""}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Grid (5x3) */}
      <div
        className={`${styles.overlay} ${isVisible && mainGrid.length > 0 ? styles.visible : styles.hidden}`}
        style={{
          left: position.x + 7 * cellWidth, // 7 frets to the right
          top: position.y - 1 * cellHeight, // 1 string up, centered for 3-row grid
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

      {/* Bottom Grid (5x2) */}
      <div
        className={`${styles.overlay} ${isVisible && bottomGrid.length > 0 ? styles.visible : styles.hidden}`}
        style={{
          left: position.x + 5 * cellWidth, // 5 frets to the right
          top: position.y + 0.5 * cellHeight, // 1 string down - 0.5 for grid center
        }}
      >
        <div className={styles.bottomGrid}>
          {bottomGrid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isHighlighted = colIndex === 0 || colIndex === 2 || colIndex === 4; // Left, center, right columns
              return (
                <div
                  key={`bottom-${rowIndex}-${colIndex}`}
                  className={`${styles.gridCell} ${cell.isCenter ? styles.centerCell : ""} ${!cell.visible ? styles.emptyCell : ""} ${cell.visible ? (isHighlighted ? styles.highlightedNote : styles.dimmedNote) : ""}`}
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