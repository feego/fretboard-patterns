"use client";

import { useEffect, useRef, useState } from "react";
import FirstOverlay from "./FirstOverlay";
import * as styles from "./Fretboard.css";
import FretboardControls from "./FretboardControls";
import SecondOverlay from "./SecondOverlay";
import StringLabels from "./StringLabels";

export default function Fretboard() {
  // Track toggled cells relative to the overlay's current visible fret (continuousFret)
  const [toggledCells, setToggledCells] = useState<Record<string, boolean>>({});
  // When a cell is clicked, store the cellId using the current overlay's continuousFret as base
  const handleCellToggle = (cellId: string) => {
    setToggledCells((prev) => ({ ...prev, [cellId]: !prev[cellId] }));
  };
  // Tuning-aware string labels (top to bottom: high to low)
  // Standard: high E to low E; All Fourths: high F to low E
  const [tuning, setTuning] = useState("standard");
  const [hasMounted, setHasMounted] = useState(false);

  // On mount, sync tuning from localStorage (client only)
  useEffect(() => {
    setHasMounted(true);
    try {
      const stored = window.localStorage.getItem("fretboard-tuning");
      if (stored === "standard" || stored === "allFourths") setTuning(stored);
    } catch {}
  }, []);
  const strings =
    tuning === "allFourths"
      ? ["F", "C", "G", "D", "A", "E"]
      : ["E", "B", "G", "D", "A", "E"]; // Inverted order: high to low
  // Persist tuning to localStorage
  useEffect(() => {
    if (hasMounted) {
      try {
        window.localStorage.setItem("fretboard-tuning", tuning);
      } catch {}
    }
  }, [tuning, hasMounted]);

  // Stable keys for string rows to avoid index-based keys and handle duplicate names in standard tuning
  const stringRowKeys =
    tuning === "allFourths"
      ? ["F", "C", "G", "D", "A", "E"]
      : ["E-top", "B", "G", "D", "A", "E-bottom"];
  const frets = 24;
  const markerFrets = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24]; // Extended marker frets

  const [basePosition, setBasePosition] = useState({ x: 0, y: 0 });
  const [isOverlayVisible, _setIsOverlayVisible] = useState(true); // Always visible
  const [currentFret, setCurrentFret] = useState<{
    string: number;
    fret: number;
  }>({ string: 4, fret: 12 }); // 2 strings down (string 4 = A)
  const [continuousFret, setContinuousFret] = useState(12); // Track continuous position for infinite scroll
  const [showDimmedNotes, setShowDimmedNotes] = useState(false);
  const [swapBg, setSwapBg] = useState(false);
  const [showDegrees, setShowDegrees] = useState(false);
  const fretboardRef = useRef<HTMLDivElement>(null);
  const cellWidth = 64; // 4rem * 16px

  // Initialize position on mount
  useEffect(() => {
    // Add a small delay to ensure CSS is fully loaded
    const timer = setTimeout(() => {
      if (fretboardRef.current) {
        const fretElement = fretboardRef.current.querySelector(
          '[data-string="4"][data-fret-number="12"]',
        ) as HTMLElement;
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
      if (!currentFret) return;

      let newString = currentFret.string;
      let newContinuousFret = continuousFret;
      let fretDelta = 0;
      let stringDelta = 0;
      switch (e.key) {
        case "ArrowUp":
          newContinuousFret = continuousFret + 5;
          setSwapBg((s) => !s);
          stringDelta = -1;
          e.preventDefault();
          break;
        case "ArrowDown":
          newContinuousFret = continuousFret - 5;
          setSwapBg((s) => !s);
          stringDelta = 1;
          e.preventDefault();
          break;
        case "ArrowLeft":
          newContinuousFret = continuousFret - 1;
          fretDelta = -1;
          e.preventDefault();
          break;
        case "ArrowRight":
          newContinuousFret = continuousFret + 1;
          fretDelta = 1;
          e.preventDefault();
          break;
        default:
          return;
      }

      // Calculate wrapped fret (1-24) from continuous fret
      let wrappedFret = ((newContinuousFret - 1) % 24) + 1;
      if (wrappedFret <= 0) wrappedFret += 24;

      // Move toggled cells by stringDelta (vertical) or fretDelta (horizontal)
      setToggledCells((prev) => {
        const updated: Record<string, boolean> = {};
        Object.entries(prev).forEach(([cellId, value]) => {
          if (!value) return;
          const [strIdx, fretNum] = cellId.split(":").map(Number);
          let newStrIdx = strIdx + stringDelta;
          let newFretNum = fretNum + fretDelta;
          if (newFretNum < 1) newFretNum = 24;
          if (newFretNum > 24) newFretNum = 1;
          if (newStrIdx < 0 || newStrIdx > 5) return;
          updated[`${newStrIdx}:${newFretNum}`] = true;
        });
        return updated;
      });

      if (
        newString !== currentFret.string ||
        newContinuousFret !== continuousFret
      ) {
        setContinuousFret(newContinuousFret);
        setCurrentFret({ string: newString, fret: wrappedFret });

        // Update base position for string changes only
        if (newString !== currentFret.string && fretboardRef.current) {
          const fretElement = fretboardRef.current.querySelector(
            `[data-string="${newString}"][data-fret-number="${wrappedFret}"]`,
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

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentFret, continuousFret, basePosition.x]);
  // Calculate current position with modulo to keep overlays cycling
  // Use modulo 24 frets (2 full cycles of 12) to keep overlays within range
  let effectiveFret = (continuousFret - 12) % 24;
  // Handle negative modulo correctly
  if (effectiveFret < 0) effectiveFret += 24;
  const currentPosition = {
    x: basePosition.x + effectiveFret * cellWidth,
    y: basePosition.y,
  };

  // Prevent hydration mismatch: only render after mount
  if (!hasMounted) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Guitar Fretboard Visualizer</h1>
      <div className={styles.fretboardWrapper}>
        {/* Fret numbers above the fretboard */}
        <div
          style={{
            marginLeft: "0rem",
            marginBottom: "0.5rem",
            display: "flex",
          }}
        >
          <div style={{ width: "2rem" }}></div>
          <div className={styles.stringRow}>
            {[...Array(frets)].map((_, fretIndex) => {
              const fretNumber = fretIndex + 1;
              return (
                <div
                  key={`fret-number-${fretNumber}`}
                  className={styles.fret}
                  style={{
                    height: "auto",
                    padding: "0.25rem 0",
                    border: "none",
                    backgroundColor: "transparent",
                    fontSize: "0.7rem",
                    color: "#a3a3a3",
                    fontWeight: "600",
                  }}
                >
                  {fretNumber}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.fretboardRow}>
          <StringLabels strings={strings} stringKeys={stringRowKeys} />
          <div className={styles.fretboard} ref={fretboardRef}>
            {strings.map((_string, stringIndex) => (
              <div
                key={stringRowKeys[stringIndex]}
                className={styles.stringRow}
              >
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
                      key={`fret-${fretNumber}`}
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
              const cycleOffset = Math.floor(i / 2) - 5;
              const isFirst = i % 2 === 0;
              const OverlayComponent = isFirst ? FirstOverlay : SecondOverlay;
              const bgVariant = isFirst
                ? swapBg
                  ? "B"
                  : "A"
                : swapBg
                  ? "A"
                  : "B";
              const zIndex = isFirst ? 999 : 1001;
              return (
                <OverlayComponent
                  key={`overlay-${cycleOffset}-${isFirst ? "A" : "B"}`}
                  isVisible={isOverlayVisible}
                  mousePosition={{
                    x: currentPosition.x + cycleOffset * 12 * cellWidth,
                    y: currentPosition.y,
                  }}
                  snappedPosition={{
                    x: currentPosition.x + cycleOffset * 12 * cellWidth,
                    y: currentPosition.y,
                  }}
                  currentFret={currentFret}
                  showDimmedNotes={showDimmedNotes}
                  tuning={tuning}
                  bgVariant={bgVariant}
                  zIndex={zIndex}
                  showDegrees={showDegrees}
                  toggledCells={toggledCells}
                  onCellToggle={handleCellToggle}
                />
              );
            })}
          </div>
        </div>
      </div>

      <FretboardControls
        showDimmedNotes={showDimmedNotes}
        onToggleDimmedNotes={() => setShowDimmedNotes(!showDimmedNotes)}
        tuning={tuning}
        onTuningChange={setTuning}
        showDegrees={showDegrees}
        onToggleDegrees={() => setShowDegrees((v) => !v)}
      />
    </div>
  );
}
