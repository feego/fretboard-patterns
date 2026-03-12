"use client";

import { useEffect, useRef, useState } from "react";
import * as styles from "./YoutubePlayer.css";

// How many ms before metronome beat 1 to unmute. Accounts for the ~1 frame of
// audio decode that still happens after unMute() is called.
const VIDEO_LEAD_MS = 280;

function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Plain video ID (11 chars, alphanumeric + - _)
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    // youtu.be/VIDEO_ID
    if (url.hostname === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      if (id && /^[\w-]{11}$/.test(id)) return id;
    }
    // youtube.com/watch?v=VIDEO_ID
    const v = url.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return v;
    // youtube.com/embed/VIDEO_ID
    const embedMatch = url.pathname.match(/\/embed\/([\w-]{11})/);
    if (embedMatch) return embedMatch[1];
  } catch {
    // not a valid URL — fall through
  }
  return null;
}

interface YoutubePlayerProps {
  metronomeState: "stopped" | "running" | "paused";
  onStopMetronome: () => void;
  bpm: number;
  suggestion?: { id: string; offset: number };
  /** When the panel opens leftward, align its left edge with this element. */
  panelAlignRef?: React.RefObject<HTMLElement | null>;
  /** When the panel opens rightward, align its right edge with this element. */
  rightAlignRef?: React.RefObject<HTMLElement | null>;
}

export default function YoutubePlayer({ metronomeState, onStopMetronome, bpm, suggestion, panelAlignRef, rightAlignRef }: YoutubePlayerProps) {
  const [expanded, setExpanded] = useState(false);
  const [openLeft, setOpenLeft] = useState(true);
  const [panelWidthPx, setPanelWidthPx] = useState<number | null>(null);
  const [urlDraft, setUrlDraft] = useState("");
  const [offsetSeconds, setOffsetSeconds] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isVolumeExpanded, setIsVolumeExpanded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const volumeAreaRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const apiReadyRef = useRef(false);
  const videoIdRef = useRef<string | null>(null);
  const offsetRef = useRef(offsetSeconds);
  const volumeRef = useRef(volume);
  const onStopRef = useRef(onStopMetronome);
  const prevMetronomeStateRef = useRef(metronomeState);
  const pendingPlayRef = useRef(false);
  const shouldPlayOnReadyRef = useRef(false);
  const mutePlayOnReadyRef = useRef(false);
  const preBufferingRef = useRef(false);
  const countInTimerRef = useRef<number | null>(null);
  const prePlayTimerRef = useRef<number | null>(null);
  const bpmRef = useRef(bpm);
  const autoCollapseTimerRef = useRef<number | null>(null);
  const isPanelHoveredRef = useRef(false);
  const isPanelFocusedRef = useRef(false);
  const prevSuggestionRef = useRef(suggestion);
  const isPreloadedRef = useRef(false);
  // Tracks the wall-clock moment the count-in began and its total duration.
  // Used by onStateChange(PLAYING) to compute the precise unmute delay.
  const countInStartTimeRef = useRef(0);
  const countInMsRef = useRef(0);
  // True while the video is playing muted during the count-in (not pre-buffering).
  const isCountInMutedPlayRef = useRef(false);
  const metronomeStateRef = useRef(metronomeState);
  const urlDraftRef = useRef(urlDraft);

  // Apply song suggestion when it changes
  useEffect(() => {
    const prev = prevSuggestionRef.current;
    prevSuggestionRef.current = suggestion;
    if (!suggestion) return;
    if (prev?.id === suggestion.id && prev?.offset === suggestion.offset) return;
    setUrlDraft(suggestion.id);
    offsetRef.current = suggestion.offset; // update ref immediately for preload
    setOffsetSeconds(suggestion.offset);
    videoIdRef.current = null;
    isPreloadedRef.current = false;
    preBufferingRef.current = false;
    shouldPlayOnReadyRef.current = false;
    mutePlayOnReadyRef.current = false;
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch {}
      playerRef.current = null;
      if (iframeContainerRef.current) iframeContainerRef.current.innerHTML = "";
    }
    // triggerPreload will fire via the urlDraft effect on next render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestion]);

  // Keep refs in sync with state/props
  useEffect(() => {
    offsetRef.current = offsetSeconds;
    // If already preloaded, reposition silently to the new offset
    if (isPreloadedRef.current && playerRef.current) {
      try { playerRef.current.seekTo(offsetSeconds, true); } catch {}
    }
  }, [offsetSeconds]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { onStopRef.current = onStopMetronome; }, [onStopMetronome]);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { metronomeStateRef.current = metronomeState; }, [metronomeState]);
  useEffect(() => { urlDraftRef.current = urlDraft; }, [urlDraft]);

  // Preload whenever the URL changes to a valid ID (and API is ready)
  useEffect(() => {
    const id = extractVideoId(urlDraft);
    if (!id) return;
    triggerPreload(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlDraft]);

  // Load YouTube IFrame API once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).YT?.Player) {
      apiReadyRef.current = true;
      // API was already loaded — preload immediately if a URL is set
      const id = extractVideoId(urlDraftRef.current);
      if (id) triggerPreload(id);
      return;
    }
    const existing = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
    const prev = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      apiReadyRef.current = true;
      prev?.();
      if (pendingPlayRef.current && videoIdRef.current) {
        pendingPlayRef.current = false;
        // API wasn't ready during count-in; play immediately now (best-effort)
        shouldPlayOnReadyRef.current = true;
        createPlayer(videoIdRef.current);
      } else {
        // No pending play — preload so first press plays instantly
        const id = extractVideoId(urlDraftRef.current);
        if (id) triggerPreload(id);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createPlayer = (id: string) => {
    if (!iframeContainerRef.current) return;
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch {}
      playerRef.current = null;
    }
    iframeContainerRef.current.innerHTML = "";
    const mount = document.createElement("div");
    iframeContainerRef.current.appendChild(mount);

    // Capture at creation time — the timer may flip shouldPlayOnReadyRef before onReady fires
    const playImmediately = shouldPlayOnReadyRef.current;

    playerRef.current = new (window as any).YT.Player(mount, {
      videoId: id,
      width: "0",
      height: "0",
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
      },
      events: {
        onReady: (e: any) => {
          e.target.setVolume(volumeRef.current);
          if (playImmediately || shouldPlayOnReadyRef.current) {
            // Timers already fired before onReady — play immediately with audio.
            shouldPlayOnReadyRef.current = false;
            mutePlayOnReadyRef.current = false;
            preBufferingRef.current = false;
            e.target.unMute();
            e.target.setVolume(volumeRef.current);
            e.target.seekTo(offsetRef.current, true);
            e.target.playVideo();
          } else if (mutePlayOnReadyRef.current) {
            // Count-in is running — start playing muted; onStateChange(PLAYING)
            // will measure the actual startup latency and schedule unMute() precisely.
            mutePlayOnReadyRef.current = false;
            preBufferingRef.current = false;
            isCountInMutedPlayRef.current = true;
            e.target.mute();
            e.target.seekTo(offsetRef.current, true);
            e.target.playVideo();
          } else {
            // Pre-buffer during count-in: mute and start loading from the offset
            // silently. onStateChange(PLAYING) will pause it immediately.
            preBufferingRef.current = true;
            e.target.mute();
            e.target.loadVideoById({ videoId: id, startSeconds: offsetRef.current });
          }
        },
        onStateChange: (e: any) => {
          const YT = (window as any).YT;
          if (e.data === YT.PlayerState.PLAYING) {
            if (shouldPlayOnReadyRef.current) {
              // All timers fired before onReady resolved — keep playing, restore audio
              shouldPlayOnReadyRef.current = false;
              preBufferingRef.current = false;
              e.target.unMute();
              e.target.setVolume(volumeRef.current);
            } else if (isCountInMutedPlayRef.current) {
              // Audio is now flowing. Measure actual startup latency and schedule
              // unMute() for exactly VIDEO_LEAD_MS before beat 1.
              isCountInMutedPlayRef.current = false;
              const elapsed = performance.now() - countInStartTimeRef.current;
              const remainingMs = Math.max(0, countInMsRef.current - elapsed - VIDEO_LEAD_MS);
              countInTimerRef.current = window.setTimeout(() => {
                countInTimerRef.current = null;
                const p = playerRef.current;
                if (p) {
                  p.unMute();
                  p.setVolume(volumeRef.current);
                } else {
                  shouldPlayOnReadyRef.current = true;
                  mutePlayOnReadyRef.current = false;
                }
              }, remainingMs);
            } else if (preBufferingRef.current) {
              // Silent pre-buffer phase: pause as soon as the video starts playing
              preBufferingRef.current = false;
              isPreloadedRef.current = true; // buffered at offset, ready for instant play
              e.target.pauseVideo();
            }
          } else if (e.data === YT.PlayerState.ENDED) {
            onStopRef.current();
          }
        },
      },
    });
  };

  const clearCountInTimer = () => {
    if (countInTimerRef.current != null) {
      window.clearTimeout(countInTimerRef.current);
      countInTimerRef.current = null;
    }
    if (prePlayTimerRef.current != null) {
      window.clearTimeout(prePlayTimerRef.current);
      prePlayTimerRef.current = null;
    }
    isCountInMutedPlayRef.current = false;
  };

  // Create a player in silent pre-buffer mode so it's buffered at the offset
  // before the user hits play. Safe to call multiple times — idempotent.
  const triggerPreload = (id: string) => {
    if (!id || !apiReadyRef.current) return;
    if (metronomeStateRef.current === "running" || metronomeStateRef.current === "paused") return;
    if (isPreloadedRef.current && videoIdRef.current === id) return;
    clearCountInTimer();
    isPreloadedRef.current = false;
    shouldPlayOnReadyRef.current = false;
    mutePlayOnReadyRef.current = false;
    preBufferingRef.current = false;
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch {}
      playerRef.current = null;
    }
    if (iframeContainerRef.current) iframeContainerRef.current.innerHTML = "";
    videoIdRef.current = id;
    createPlayer(id);
  };

  // React to metronome state changes
  useEffect(() => {
    const prev = prevMetronomeStateRef.current;
    prevMetronomeStateRef.current = metronomeState;

    if (metronomeState === "running" && prev !== "running") {
      const id = videoIdRef.current ?? extractVideoId(urlDraft);
      if (!id) return;
      videoIdRef.current = id;

      if (prev === "paused") {
        // Resume: play immediately, no count-in
        if (playerRef.current) {
          playerRef.current.playVideo();
        } else {
          if (!apiReadyRef.current) { pendingPlayRef.current = true; return; }
          shouldPlayOnReadyRef.current = true;
          createPlayer(id);
        }
      } else {
        // Fresh start from stopped:
        // If already pre-buffered: player is muted + paused at offset — skip createPlayer.
        // Otherwise: create player now (will pre-buffer during count-in as fallback).
        clearCountInTimer();
        shouldPlayOnReadyRef.current = false;
        mutePlayOnReadyRef.current = false;
        preBufferingRef.current = false;

        if (!apiReadyRef.current) {
          pendingPlayRef.current = true;
          return;
        }

        // Record count-in start time before kicking off muted play.
        // onStateChange(PLAYING) will use this to compute the actual startup
        // latency and schedule unMute() with a precise remaining delay.
        const countInMs = 4 * (60 / bpmRef.current) * 1000;
        countInStartTimeRef.current = performance.now();
        countInMsRef.current = countInMs;

        if (!isPreloadedRef.current) {
          // Player not ready yet — create it; onReady will start playing muted
          // and set isCountInMutedPlayRef so onStateChange can schedule unmute.
          mutePlayOnReadyRef.current = true;
          createPlayer(id);
        } else {
          // Already buffered and paused at offset — start playing muted immediately.
          const p = playerRef.current;
          if (p) {
            isCountInMutedPlayRef.current = true;
            try { p.playVideo(); } catch {}
          } else {
            mutePlayOnReadyRef.current = true;
          }
        }
        isPreloadedRef.current = false;
        // No setTimeout here — unMute() is scheduled inside onStateChange(PLAYING)
        // once we know the video's actual startup latency.
      }
    } else if (metronomeState === "paused") {
      clearCountInTimer();
      preBufferingRef.current = false;
      playerRef.current?.pauseVideo();
    } else if (metronomeState === "stopped") {
      clearCountInTimer();
      preBufferingRef.current = false;
      pendingPlayRef.current = false;
      const p = playerRef.current;
      if (p) {
        try { p.pauseVideo(); } catch {}
        try { p.seekTo(offsetRef.current, true); } catch {}
        try { p.mute(); } catch {}
        isPreloadedRef.current = true; // ready for next play without any loading
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metronomeState]);

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    volumeRef.current = v;
    playerRef.current?.setVolume(v);
  };

  // Auto-collapse helpers
  const clearAutoCollapse = () => {
    if (autoCollapseTimerRef.current != null) {
      window.clearTimeout(autoCollapseTimerRef.current);
      autoCollapseTimerRef.current = null;
    }
  };

  const scheduleAutoCollapse = () => {
    if (isPanelHoveredRef.current || isPanelFocusedRef.current) return;
    clearAutoCollapse();
    autoCollapseTimerRef.current = window.setTimeout(() => {
      setExpanded(false);
    }, 3000);
  };

  useEffect(() => {
    if (expanded) {
      setTimeout(() => inputRef.current?.focus(), 50);
      scheduleAutoCollapse();
    } else {
      clearAutoCollapse();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  // Close volume overlay on outside click
  useEffect(() => {
    if (!isVolumeExpanded) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      const root = volumeAreaRef.current;
      if (!target || !root || root.contains(target)) return;
      setIsVolumeExpanded(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [isVolumeExpanded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCountInTimer();
      clearAutoCollapse();
      try { playerRef.current?.destroy(); } catch {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.wrapper}>
      <div ref={iframeContainerRef} className={styles.iframeContainer} />

      <div className={styles.controls}>
        <div className={`${styles.ytPanelWrapper}${expanded ? ` ${styles.ytPanelWrapperExpanded}` : ""}`}>
        <button
          ref={toggleButtonRef}
          type="button"
          className={styles.toggleButton}
          onClick={() => {
            const next = !expanded;
            if (next && toggleButtonRef.current) {
              const rect = toggleButtonRef.current.getBoundingClientRect();
              // Open toward whichever side has more space.
              const spaceRight = window.innerWidth - rect.right;
              const spaceLeft = rect.left;
              const goLeft = spaceLeft > spaceRight;
              setOpenLeft(goLeft);
              // Stretch to align left edge with the song picker (or fall back to button left)
              if (goLeft) {
                const alignLeft = panelAlignRef?.current
                  ? panelAlignRef.current.getBoundingClientRect().left
                  : rect.left;
                // Panel right edge sits ~8px left of the button; width fills back to alignLeft
                setPanelWidthPx(Math.max(0, Math.round(rect.left - 8 - alignLeft)));
              } else {
                if (rightAlignRef?.current) {
                  const rightRect = rightAlignRef.current.getBoundingClientRect();
                  // panel left edge = button.right + 8px (0.5rem); fill to rightRect.right
                  setPanelWidthPx(Math.max(0, Math.round(rightRect.right - rect.right - 8)));
                } else {
                  setPanelWidthPx(null);
                }
              }
            } else if (!next) {
              setPanelWidthPx(null);
            }
            setExpanded(next);
          }}
          title={expanded ? "Hide YouTube player" : "Play YouTube audio"}
          aria-label="Toggle YouTube player"
        >
          ▶ YT
        </button>

        {expanded && (
          <div
            className={openLeft ? styles.panelLeft : styles.panelRight}
            style={panelWidthPx != null ? { width: panelWidthPx } : undefined}
            onPointerEnter={() => {
              isPanelHoveredRef.current = true;
              clearAutoCollapse();
            }}
            onPointerLeave={() => {
              isPanelHoveredRef.current = false;
              scheduleAutoCollapse();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className={styles.urlInput}
              placeholder="YouTube URL or ID"
              value={urlDraft}
              onChange={(e) => {
                setUrlDraft(e.target.value);
                // Reset loaded video so the urlDraft effect triggers a fresh preload
                videoIdRef.current = null;
                isPreloadedRef.current = false;
                if (playerRef.current) {
                  try { playerRef.current.destroy(); } catch {}
                  playerRef.current = null;
                  if (iframeContainerRef.current) iframeContainerRef.current.innerHTML = "";
                }
              }}
              onFocus={() => {
                isPanelFocusedRef.current = true;
                clearAutoCollapse();
              }}
              onBlur={() => {
                isPanelFocusedRef.current = false;
                scheduleAutoCollapse();
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setExpanded(false);
              }}
            />
            <div className={styles.offsetInputWrapper}>
              <input
                type="number"
                className={styles.offsetInput}
                min={0}
                step={1}
                value={offsetSeconds}
                onChange={(e) => {
                  const v = Math.max(0, Number(e.target.value));
                  if (!Number.isFinite(v)) return;
                  setOffsetSeconds(v);
                }}
                onFocus={() => {
                  isPanelFocusedRef.current = true;
                  clearAutoCollapse();
                }}
                onBlur={() => {
                  isPanelFocusedRef.current = false;
                  scheduleAutoCollapse();
                }}
                title={`Start at ${offsetSeconds}s`}
                aria-label="Video start offset in seconds"
              />
              <span>s</span>
            </div>

            <div ref={volumeAreaRef} className={styles.ytVolumeWrapper}>
              <button
                type="button"
                className={styles.ytVolumeButton}
                onClick={() => setIsVolumeExpanded((v) => !v)}
                title="YouTube volume"
                aria-label="Toggle YouTube volume"
              >
                <span aria-hidden="true" className={styles.ytVolumeIcon} />
              </button>
              {isVolumeExpanded && (
                <div className={styles.ytVolumeOverlay}>
                  <input
                    type="range"
                    className={styles.ytVolumeSlider}
                    min={0}
                    max={100}
                    step={1}
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    aria-label="YouTube volume"
                  />
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
