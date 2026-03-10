"use client";

import { useEffect, useRef, useState } from "react";
import * as styles from "./YoutubePlayer.css";

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
}

export default function YoutubePlayer({ metronomeState, onStopMetronome, bpm, suggestion }: YoutubePlayerProps) {
  const [expanded, setExpanded] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [offsetSeconds, setOffsetSeconds] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isVolumeExpanded, setIsVolumeExpanded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
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
  const preBufferingRef = useRef(false);
  const countInTimerRef = useRef<number | null>(null);
  const prePlayTimerRef = useRef<number | null>(null);
  const bpmRef = useRef(bpm);
  const autoCollapseTimerRef = useRef<number | null>(null);
  const isPanelHoveredRef = useRef(false);
  const isPanelFocusedRef = useRef(false);
  const prevSuggestionRef = useRef(suggestion);

  // Apply song suggestion when it changes
  useEffect(() => {
    const prev = prevSuggestionRef.current;
    prevSuggestionRef.current = suggestion;
    if (!suggestion) return;
    if (prev?.id === suggestion.id && prev?.offset === suggestion.offset) return;
    setUrlDraft(suggestion.id);
    setOffsetSeconds(suggestion.offset);
    videoIdRef.current = null;
    preBufferingRef.current = false;
    shouldPlayOnReadyRef.current = false;
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch {}
      playerRef.current = null;
      if (iframeContainerRef.current) iframeContainerRef.current.innerHTML = "";
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestion]);

  // Keep refs in sync with state/props
  useEffect(() => { offsetRef.current = offsetSeconds; }, [offsetSeconds]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { onStopRef.current = onStopMetronome; }, [onStopMetronome]);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);

  // Load YouTube IFrame API once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).YT?.Player) {
      apiReadyRef.current = true;
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
            // Either play was requested at creation time, or all timers already fired
            // during loading — play immediately with audio.
            shouldPlayOnReadyRef.current = false;
            preBufferingRef.current = false;
            e.target.unMute();
            e.target.setVolume(volumeRef.current);
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
            } else if (preBufferingRef.current) {
              // Silent pre-buffer phase: pause as soon as the video starts playing
              preBufferingRef.current = false;
              e.target.pauseVideo();
            }
            // Otherwise: normal muted-play phase (STARTUP_LATENCY_MS window) — let it run
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
        // 1. Create player immediately — it mutes + loadVideoById during count-in (pre-buffering)
        // 2. STARTUP_LATENCY_MS before beat 1: call playVideo() while still muted
        // 3. Exactly at beat 1: unMute() — audio appears right on the beat
        clearCountInTimer();
        shouldPlayOnReadyRef.current = false;
        preBufferingRef.current = false;

        if (!apiReadyRef.current) {
          pendingPlayRef.current = true;
          return;
        }

        createPlayer(id);

        // How much earlier to call playVideo() to compensate for startup latency.
        // Tune this if audio still lags (increase) or plays too early (decrease).
        const STARTUP_LATENCY_MS = 300;
        const countInMs = 4 * (60 / bpmRef.current) * 1000;
        const playEarlyMs = Math.max(0, countInMs - STARTUP_LATENCY_MS);

        // Fire playVideo() a bit before beat 1, still muted
        prePlayTimerRef.current = window.setTimeout(() => {
          prePlayTimerRef.current = null;
          preBufferingRef.current = false;
          const p = playerRef.current;
          if (p) {
            p.playVideo(); // muted — no audible sound yet
          } else {
            // onReady hasn't fired yet; flag to play+unmute immediately in onReady
            shouldPlayOnReadyRef.current = true;
          }
        }, playEarlyMs);

        // Unmute exactly at beat 1
        countInTimerRef.current = window.setTimeout(() => {
          countInTimerRef.current = null;
          const p = playerRef.current;
          if (p) {
            p.unMute();
            p.setVolume(volumeRef.current);
          } else {
            // Player not ready yet; onReady will handle play+unmute
            shouldPlayOnReadyRef.current = true;
          }
        }, countInMs);
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
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setExpanded((v) => !v)}
          title={expanded ? "Hide YouTube player" : "Play YouTube audio"}
          aria-label="Toggle YouTube player"
        >
          ▶ YT
        </button>

        {expanded && (
          <div
            className={styles.panel}
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
                // Reset loaded video so next play picks up the new URL
                videoIdRef.current = null;
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
  );
}
