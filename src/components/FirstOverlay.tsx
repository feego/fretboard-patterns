"use client";

import * as styles from "./FirstOverlay.css";
import OverlayRow from "./OverlayRow";

interface FirstOverlayProps {
  isVisible: boolean;
  mousePosition: { x: number; y: number };
  snappedPosition: { x: number; y: number } | null;
  currentFret: { string: number; fret: number } | null;
  showDimmedNotes: boolean;
  tuning: string;
  bgVariant?: "A" | "B";
  zIndex?: number;
}

export default function FirstOverlay({
  isVisible,
  mousePosition,
  snappedPosition,
  currentFret,
  showDimmedNotes,
  tuning,
  bgVariant = "A",
  zIndex,
}: FirstOverlayProps) {
  const position = snappedPosition || mousePosition;

  const rootFontSize = 16;
  const cellWidth = 4 * rootFontSize;
  const cellHeight = 3 * rootFontSize;

  // Configuration for each string's row
  // String indices: 0=high E (top), 5=low E (bottom)
  // startFret is offset from currentFret (e.g., -11 means 11 frets to the left)
  const rowConfigs = [
    { stringIndex: 0, startFret: -6, numFrets: 5, gridStyle: styles.thirdGrid }, // Top string (high E): shifted 1 right
    {
      stringIndex: 1,
      startFret: -8,
      numFrets: 7,
      gridStyle: styles.fourthGrid,
    }, // String 2: 7 columns
    { stringIndex: 2, startFret: -9, numFrets: 5, gridStyle: styles.thirdGrid }, // String 3 (G): shifted 1 fret right
    {
      stringIndex: 3,
      startFret: -11,
      numFrets: 7,
      gridStyle: styles.fourthGrid,
    }, // String 4: 7 columns
    {
      stringIndex: 4,
      startFret: -11,
      numFrets: 5,
      gridStyle: styles.thirdGrid,
    }, // String 5 (A): 5 columns, shifted 1 fret right
    {
      stringIndex: 5,
      startFret: -1,
      numFrets: 7,
      gridStyle: styles.fourthGrid,
    }, // Bottom string (low E): 7 columns
  ];

  return (
    <>
      {rowConfigs.map((config) => (
        <OverlayRow
          key={`first-overlay-string-${config.stringIndex}`}
          stringIndex={config.stringIndex}
          startFret={config.startFret}
          numFrets={config.numFrets}
          currentFret={currentFret}
          showDimmedNotes={showDimmedNotes}
          isVisible={isVisible}
          position={position}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          gridClassName={`${config.gridStyle}`}
          cellClassName={styles.gridCell}
          centerCellClassName={styles.centerCell}
          emptyCellClassName={styles.emptyCell}
          highlightedNoteClassName={styles.highlightedNote}
          dimmedNoteClassName={styles.dimmedNote}
          overlayClassName={styles.overlay}
          visibleClassName={styles.visible}
          hiddenClassName={styles.hidden}
          tuning={tuning}
          backgroundColor={bgVariant === "A" ? "#1a1a1a" : "#2a2a2a"}
        />
      ))}
    </>
  );
}
