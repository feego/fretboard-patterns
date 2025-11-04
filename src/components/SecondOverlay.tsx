"use client";

import * as styles from "./SecondOverlay.css";
import OverlayRow from "./OverlayRow";

interface SecondOverlayProps {
  isVisible: boolean;
  mousePosition: { x: number; y: number };
  snappedPosition: { x: number; y: number } | null;
  currentFret: { string: number; fret: number } | null;
  showDimmedNotes: boolean;
  tuning: string;
}

export default function SecondOverlay({ 
  isVisible, 
  mousePosition, 
  snappedPosition,
  currentFret,
  showDimmedNotes,
  tuning,
}: SecondOverlayProps) {
  const position = snappedPosition || mousePosition;
  
  const rootFontSize = 16;
  const cellWidth = 4 * rootFontSize;
  const cellHeight = 3 * rootFontSize;

  // Configuration for each string's row
  // String indices: 0=high E (top), 5=low E (bottom)
  // startFret is offset from currentFret
  const rowConfigs = [
    { stringIndex: 0, startFret: -1, numFrets: 7, gridStyle: styles.topGrid },          // Top string (high E): 7 columns
    { stringIndex: 1, startFret: -1, numFrets: 5, gridStyle: styles.singleRowGrid5 },   // B string: 1 fret right
    { stringIndex: 2, startFret: -4, numFrets: 7, gridStyle: styles.topGrid },          // G string: 1 fret left
    { stringIndex: 3, startFret: -4, numFrets: 5, gridStyle: styles.singleRowGrid5 },   // D string: 1 fret right
    { stringIndex: 4, startFret: -6, numFrets: 7, gridStyle: styles.topGrid },          // A string: 1 fret left
    { stringIndex: 5, startFret: -6, numFrets: 5, gridStyle: styles.singleRowGrid5 },   // Bottom string (low E): unchanged
  ];

  return (
    <>
      {rowConfigs.map((config, idx) => (
        <OverlayRow
          key={`second-overlay-${idx}`}
          stringIndex={config.stringIndex}
          startFret={config.startFret}
          numFrets={config.numFrets}
          currentFret={currentFret}
          showDimmedNotes={showDimmedNotes}
          isVisible={isVisible}
          position={position}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          gridClassName={config.gridStyle}
          cellClassName={styles.gridCell}
          centerCellClassName={styles.centerCell}
          emptyCellClassName={styles.emptyCell}
          highlightedNoteClassName={styles.highlightedNote}
          dimmedNoteClassName={styles.dimmedNote}
          overlayClassName={styles.overlay}
          visibleClassName={styles.visible}
          hiddenClassName={styles.hidden}
          tuning={tuning}
        />
      ))}
    </>
  );
}
