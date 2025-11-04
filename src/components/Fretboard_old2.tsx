"use client";

import { useState, useRef, useEffect } from "react";
import * as styles from "./Fretboard.css";
import FirstOverlay from "./FirstOverlay";
import SecondOverlay from "./SecondOverlay";

export default function Fretboard() {
  const strings = ["E", "B", "G", "D", "A", "E"]; // Inverted order: high E to low E
  const frets = 24;
  const markerFrets = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24]; // Extended marker frets
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isOverlayVisible, setIsOverlayVisible] = useState(true); // Always visible
  const [snappedPosition, setSnappedPosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredFret, setHoveredFret] = useState<{ string: number; fret: number }>({ string: 4, fret: 12 }); // 2 strings down (string 4 = A)
  const fretboardRef = useRef<HTMLDivElement>(null);

  // Initialize position on mount
  useEffect(() => {
    if (fretboardRef.current) {
      const fretElement = fretboardRef.current.querySelector('[data-string="4"][data-fret-number="12"]') as HTMLElement;
      if (fretElement) {
        const rect = fretElement.getBoundingClientRect();
        setMousePosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
        setSnappedPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    }
  }, []);

  // Handle arrow key navigation with infinite scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hoveredFret) return;
      
      let newString = hoveredFret.string;
      let newFret = hoveredFret.fret;
      
      switch(e.key) {
        case 'ArrowUp':
          newString = Math.max(0, hoveredFret.string - 1);
          e.preventDefault();
          break;
        case 'ArrowDown':
          newString = Math.min(5, hoveredFret.string + 1);
          e.preventDefault();
          break;
        case 'ArrowLeft':
          // Allow infinite scroll left
          newFret = hoveredFret.fret - 1;
          if (newFret < 1) newFret = 24; // Wrap around
          e.preventDefault();
          break;
        case 'ArrowRight':
          // Allow infinite scroll right
          newFret = hoveredFret.fret + 1;
          if (newFret > 24) newFret = 1; // Wrap around
          e.preventDefault();
          break;
        default:
          return;
      }
      
      if (newString !== hoveredFret.string || newFret !== hoveredFret.fret) {
        setHoveredFret({ string: newString, fret: newFret });
        
        // Update position based on new fret
        if (fretboardRef.current) {
          const fretElement = fretboardRef.current.querySelector(
            `[data-string="${newString}"][data-fret-number="${newFret}"]`
          ) as HTMLElement;
          if (fretElement) {
            const rect = fretElement.getBoundingClientRect();
            const newPos = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            };
            setMousePosition(newPos);
            setSnappedPosition(newPos);
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hoveredFret]);

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Guitar Fretboard Visualizer</h1>
      <div className={styles.fretboardWrapper}>
        {/* Fret numbers above the fretboard */}
        <div style={{ marginLeft: "2rem", marginBottom: "0.5rem" }}>
          <div className={styles.stringRow}>
            {[...Array(frets)].map((_, fretIndex) => {
              const fretNumber = fretIndex + 1;
              return (
                <div
                  key={`fret-number-${fretIndex}`}
                  className={styles.fret}
                  style={{ 
                    height: "auto",
                    padding: "0.25rem 0",
                    border: "none",
                    backgroundColor: "transparent",
                    fontSize: "0.7rem",
                    color: "#a3a3a3",
                    fontWeight: "600"
                  }}
                >
                  {fretNumber}
                </div>
              );
            })}
          </div>
        </div>
        
        <div 
          className={styles.fretboard}
          ref={fretboardRef}
        >
          {strings.map((string, stringIndex) => (
            <div key={stringIndex} className={styles.stringRow}>
              <div className={styles.stringLabel}>{string}</div>
              {[...Array(frets)].map((_, fretIndex) => {
                const fretNumber = fretIndex + 1;
                const isMarkerFret = markerFrets.includes(fretNumber);
                const isDoubleMarker = fretNumber === 12 || fretNumber === 24;
                const isOctave = fretNumber === 12;
                const isFirstFret = fretIndex === 0;
                const isMiddleString = stringIndex === 2; // G string is now at index 2 (3rd from top)
                
                let fretClasses = styles.fret;
                if (isFirstFret) fretClasses += ` ${styles.firstFret}`;
                if (isOctave) fretClasses += ` ${styles.octaveFret}`;
                
                // Show markers only on the D string but position them to appear centered between D and G
                if (isMarkerFret && !isDoubleMarker && isMiddleString) {
                  fretClasses += ` ${styles.markerFret}`;
                }
                if (isDoubleMarker && isMiddleString) {
                  fretClasses += ` ${styles.doubleMarkerFret}`;
                }
                
                return (
                  <div
                    key={fretIndex}
                    className={fretClasses}
                    data-fret={`${stringIndex}-${fretIndex}`}
                    data-string={stringIndex}
                    data-fret-number={fretNumber}
                  >
                    {/* Note markers can be added here later */}
                  </div>
                );
              })}
            </div>
          ))}
          
          {/* Render multiple overlays in alternating pattern */}
          {/* Each "cycle" is 12 frets and contains both FirstOverlay and SecondOverlay at the same position */}
          {Array.from({ length: 9 }, (_, i) => {
            const cycleOffset = Math.floor(i / 2) - 2; // -2, -2, -1, -1, 0, 0, 1, 1, 2
            const isFirst = i % 2 === 0;
            const OverlayComponent = isFirst ? FirstOverlay : SecondOverlay;
            
            return (
              <OverlayComponent
                key={`overlay-${i}`}
                isVisible={isOverlayVisible}
                mousePosition={{
                  x: mousePosition.x + cycleOffset * 12 * 40,
                  y: mousePosition.y
                }}
                snappedPosition={snappedPosition ? {
                  x: snappedPosition.x + cycleOffset * 12 * 40,
                  y: snappedPosition.y
                } : null}
                hoveredFret={hoveredFret}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
