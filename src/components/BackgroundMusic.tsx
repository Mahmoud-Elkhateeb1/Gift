// BackgroundMusic.tsx
// Copy-paste ready. Replace `/music/background.mp3` with your actual audio file path or URL.
// This component uses a plain HTMLAudioElement (far more reliable on mobile than forcing the YouTube iframe API).
// It handles play/pause (must be started by user gesture), mute/unmute, stable event handling, and mobile quirks.

import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

const AUDIO_SRC = "/music/background.mp3"; // ← Replace with your file or public URL (or import and use the imported path)

interface BackgroundMusicProps {
  autoPlay?: boolean; // When true, automatically start playing
}

const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ autoPlay = false }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestedPlayRef = useRef(false); // tracks if user requested play before audio ready
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Create audio element once
  useEffect(() => {
    // If you prefer to use an <audio> element in the DOM (so devtools shows it), you can render it instead.
    // Here we create it programmatically for control and to avoid visible default controls.
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    audio.volume = 0.6;
    audio.muted = isMuted;
    audioRef.current = audio;

    const onCanPlay = () => {
      setIsReady(true);
      // If user clicked play before the audio was ready, trigger it now
      if (requestedPlayRef.current) {
        // Attempt to play (this will still succeed only if the call is inside a user gesture on some browsers,
        // but in practice togglePlay will be called by a user click)
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // silent fail — UI will show paused state
          setIsPlaying(false);
        });
        requestedPlayRef.current = false;
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = (e: Event) => {
      console.warn("BackgroundMusic audio error:", e);
    };

    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);

    // Cleanup
    return () => {
      audio.pause();
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // Keep audio.muted in sync with isMuted state (handles immediate effect)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
  }, [isMuted]);

  // Auto-play when autoPlay prop becomes true
  useEffect(() => {
    if (autoPlay) {
      const audio = audioRef.current;
      if (audio) {
        if (isReady && !isPlaying) {
          // Audio is ready, play immediately
          audio.play().then(() => {
            setIsPlaying(true);
          }).catch((err) => {
            console.warn("Auto-play failed:", err);
          });
        } else if (!isReady) {
          // Audio not ready yet, mark for auto-play when ready
          requestedPlayRef.current = true;
        }
      }
    }
  }, [autoPlay, isReady, isPlaying]);

  // toggle play/pause — MUST be called by a user gesture (button click / touch)
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) {
      requestedPlayRef.current = true;
      return;
    }

    // If not ready yet (network latency), still mark user requested play so it auto-starts on canplay
    if (!isReady) {
      requestedPlayRef.current = true;
    }

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        // Ensure unmuting behavior: if muted and user wants play, do NOT forcibly unmute — respect user's mute toggle.
        // Attempt to play; browsers require a user gesture for sound on mobile — this call is invoked by a click so it should work.
        const p = audio.play();
        if (p !== undefined) {
          await p;
          setIsPlaying(true);
        } else {
          // Older browsers: if no promise returned, rely on events
          setIsPlaying(true);
        }
      }
    } catch (err) {
      // Play failed (common if not user gesture). Keep state consistent and log.
      console.warn("Playback failed:", err);
      setIsPlaying(false);
      // If you want to auto-try muted-play (to "unlock" audio) you could do:
      // audio.muted = true; await audio.play(); audio.muted = isMuted;
      // but we'll not auto-mute for user clarity.
    }
  };

  // toggle mute/unmute — allowed anytime
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) {
      setIsMuted((v) => !v);
      return;
    }
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  // Optional: Pause audio when page visibility lost (prevents playback in background/tab if undesired).
  // Comment this out if you want continuous playback even when tab not visible.
  useEffect(() => {
    const handleVisibility = () => {
      // keep playing when hidden? if you'd like to pause, uncomment pause lines
      // if (document.hidden) audioRef.current?.pause();
      // else if (isPlaying) audioRef.current?.play();
      // We'll keep audio running by default. If you'd prefer auto-pause, enable above lines.
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isPlaying]);

  return (
    <>
      {/* Hidden <audio> for debug or fallback (kept offscreen). The audio element is created programmatically above,
          but we render a small visually-hidden element for accessibility and devtools visibility. */}
      <div style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }} aria-hidden>
        <audio id="background-music-audio" src={AUDIO_SRC} preload="auto" />
      </div>

      {/* Music Control Panel - Only show after game is won */}
      {autoPlay && (
        <div
          className="fixed top-4 right-4 z-50 flex gap-2 bg-card/90 backdrop-blur-md border border-border/40 rounded-full p-2 shadow-2xl"
          role="region"
          aria-label="Background music controls"
        >
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 transition-all hover:scale-110 group"
            aria-pressed={isPlaying}
            aria-label={isPlaying ? "Pause music" : "Play music"}
            title={isPlaying ? "Pause music" : "Play music"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-primary group-hover:text-primary/80" />
            ) : (
              <Play className="w-5 h-5 text-primary group-hover:text-primary/80" />
            )}
          </button>

          {/* Mute/Unmute */}
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full bg-accent/10 hover:bg-accent/20 transition-all hover:scale-110 ${!isPlaying ? "opacity-75" : ""}`}
            aria-pressed={isMuted}
            aria-label={isMuted ? "Unmute music" : "Mute music"}
            title={isMuted ? "Unmute music" : "Mute music"}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-accent group-hover:text-accent/80" />
            ) : (
              <Volume2 className="w-5 h-5 text-accent group-hover:text-accent/80" />
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default BackgroundMusic;
