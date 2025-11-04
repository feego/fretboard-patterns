"use client";

import { useState, useRef, useEffect } from "react";
import * as styles from "./Fretboard.css";
import FirstOverlay from "./FirstOverlay";
import SecondOverlay from "./SecondOverlay";
import StringLabels from "./StringLabels";

export default function Fretboard() {
  const strings = ["E", "B", "G", "D", "A", "E"]; // Inverted order: high E to low E
  const frets = 24;
  const markerFrets = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24]; // Extended marker frets
  
  const [basePosition, setBasePosition] = useState({ x: 0, y: 0 });
  const [isOverlayVisible, setIsOverlayVisible] = useState(true); // Always visible
  const [hoveredFret, setHoveredFret] = useState<{ string: number; fret: number }>({ string: 4, fret: 12 }); // 2 strings down (string 4 = A)
  const [continuousFret, setContinuousFret] = useState(12); // Track continuous position for infinite scroll
  const fretboardRef = useRef<HTMLDivElement>(null);
  const cellWidth = 64; // 4rem * 16px

  // Initialize position on mount
  useEffect(() => {
    // Add a small delay to ensure CSS is fully loaded
    const timer = setTimeout(() => {
      if (fretboardRef.current) {
        const fretElement = fretboardRef.current.querySelector('[data-string="4"][data-fret-number="12"]') as HTMLElement;
        if (fretElement) {
          const fretRect = fretElement.getBoundingClientRect();
          const fretboardRect = fretboardRef.current.getBoundingClientRect();
          setBasePosition({
            x: fretRect.left - fretboardRect.left + fretRect.width / 2,
            y: fretRect.top - fretboardRect.top + fretRect.height / 2,
          });
        }
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle arrow key navigation with infinite scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hoveredFret) return;
      
      let newString = hoveredFret.string;
      let newContinuousFret = continuousFret;
      
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
          // Decrease continuous fret (can go negative for infinite scroll)
          newContinuousFret = continuousFret - 1;
          e.preventDefault();
          break;
        case 'ArrowRight':
          // Increase continuous fret (can go beyond 24 for infinite scroll)
          newContinuousFret = continuousFret + 1;
          e.preventDefault();
          break;
        default:
          return;
      }
      
      // Calculate wrapped fret (1-24) from continuous fret
      let wrappedFret = ((newContinuousFret - 1) % 24) + 1;
      if (wrappedFret <= 0) wrappedFret += 24;
      
      if (newString !== hoveredFret.string || newContinuousFret !== continuousFret) {
        setContinuousFret(newContinuousFret);
        setHoveredFret({ string: newString, fret: wrappedFret });
        
        // Update base position for string changes only
        if (newString !== hoveredFret.string && fretboardRef.current) {
          const fretElement = fretboardRef.current.querySelector(
            `[data-string="${newString}"][data-fret-number="${wrappedFret}"]`
          ) as HTMLElement;
          if (fretElement) {
            const fretRect = fretElement.getBoundingClientRect();
            const fretboardRect = fretboardRef.current.getBoundingClientRect();
            setBasePosition({
              x: basePosition.x, // Keep x the same
              y: fretRect.top - fretboardRect.top + fretRect.height / 2,
            });
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hoveredFret, continuousFret, basePosition.x]);
  // Calculate current position with modulo to keep overlays cycling
  // Use modulo 24 frets (2 full cycles of 12) to keep overlays within range
  const effectiveFret = ((continuousFret - 12) % 24);
  const currentPosition = {
    x: basePosition.x + effectiveFret * cellWidth,
    y: basePosition.y
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Guitar Fretboard Visualizer</h1>
      <div className={styles.fretboardWrapper}>
        {/* Fret numbers above the fretboard */}
        <div style={{ marginLeft: "0rem", marginBottom: "0.5rem", display: "flex" }}>
          <div style={{ width: "2rem" }}></div>
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
        
        <div className={styles.fretboardRow}>
          <StringLabels strings={strings} />
          <div 
            className={styles.fretboard}
            ref={fretboardRef}
          >
            {strings.map((string, stringIndex) => (
              <div key={stringIndex} className={styles.stringRow}>
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
          
          {/* Render multiple overlays in alternating pattern based on continuous fret position */}
          {Array.from({ length: 21 }, (_, i) => {
            const cycleOffset = Math.floor(i / 2) - 5; // -2, -2, -1, -1, 0, 0, 1, 1, 2
            const isFirst = i % 2 === 0;
            const OverlayComponent = isFirst ? FirstOverlay : SecondOverlay;
            
            // Calculate the continuous fret for this overlay instance
            const overlayFret = continuousFret + cycleOffset * 12;
            // Wrap it to 1-24 range for display
            let wrappedOverlayFret = ((overlayFret - 1) % 24) + 1;
            if (wrappedOverlayFret <= 0) wrappedOverlayFret += 24;
            
            return (
              <OverlayComponent
                key={`overlay-${i}`}
                isVisible={isOverlayVisible}
                mousePosition={{
                  x: currentPosition.x + cycleOffset * 12 * cellWidth,
                  y: currentPosition.y
                }}
                snappedPosition={{
                  x: currentPosition.x + cycleOffset * 12 * cellWidth,
                  y: currentPosition.y
                }}
                hoveredFret={{ string: hoveredFret.string, fret: wrappedOverlayFret }}
              />
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
