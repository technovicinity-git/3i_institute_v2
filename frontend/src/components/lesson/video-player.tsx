"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipForward,
  SkipBack,
} from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  initialPosition?: number;
  onProgress?: (seconds: number, position: number) => void;
  onComplete?: () => void;
}

export function VideoPlayer({
  videoUrl,
  initialPosition = 0,
  onProgress,
  onComplete,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // HLS setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setDuration(video.duration);
        if (initialPosition > 0) {
          video.currentTime = initialPosition;
        }
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls!.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls!.recoverMediaError();
              break;
            default:
              hls!.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      if (initialPosition > 0) {
        video.currentTime = initialPosition;
      }
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [videoUrl, initialPosition]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if video container is in view (or focused)
      const video = videoRef.current;
      if (!video) return;

      // Skip if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlayback();
          break;
        case "ArrowLeft":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;
        case "ArrowRight":
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 5);
          break;
        case "ArrowUp":
          e.preventDefault();
          const newVolUp = Math.min(1, video.volume + 0.1);
          video.volume = newVolUp;
          setVolume(newVolUp);
          break;
        case "ArrowDown":
          e.preventDefault();
          const newVolDown = Math.max(0, video.volume - 0.1);
          video.volume = newVolDown;
          setVolume(newVolDown);
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "j":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case "l":
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Show controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);
    setDuration(video.duration);
    setProgress((video.currentTime / video.duration) * 100);

    if (onProgress) {
      onProgress(video.currentTime, video.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * video.duration;
  };

  const cyclePlaybackSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length]!;
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black group overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onClick={togglePlayback}
      />

      {/* Buffering */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="w-10 h-10 rounded-full border-4 border-white border-t-transparent animate-spin" />
        </div>
      )}

      {/* Big play button */}
      {!isPlaying && !buffering && (
        <button
          onClick={togglePlayback}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-all">
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </div>
        </button>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3 pt-12 transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress bar */}
        <div
          onClick={handleSeek}
          className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer mb-3 relative group/scrub"
        >
          <div
            className="h-full bg-[#22A146] rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/scrub:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlayback}
            className="text-white hover:text-white/80"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" fill="white" />
            ) : (
              <Play className="w-5 h-5" fill="white" />
            )}
          </button>

          <button
            onClick={() => {
              const video = videoRef.current;
              if (video)
                video.currentTime = Math.max(0, video.currentTime - 10);
            }}
            className="text-white hover:text-white/80"
            title="Back 10s (J)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              const video = videoRef.current;
              if (video)
                video.currentTime = Math.min(
                  video.duration,
                  video.currentTime + 10,
                );
            }}
            className="text-white hover:text-white/80"
            title="Forward 10s (L)"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={toggleMute}
            className="text-white hover:text-white/80"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <span className="text-[12px] text-white tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          <button
            onClick={cyclePlaybackSpeed}
            className="text-[12px] font-semibold text-white hover:text-white/80 px-2"
            title="Playback speed"
          >
            {playbackSpeed}x
          </button>

          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-white/80"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
