import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  RotateCcw, 
  Tv, 
  Loader2, 
  AlertTriangle 
} from "lucide-react";
import { Channel } from "../types";

interface VideoPlayerProps {
  channel: Channel | null;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function VideoPlayer({ channel, onPrev, onNext }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingFallback, setIsPlayingFallback] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("iptv_volume");
    return saved ? parseFloat(saved) : 1.0;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [levels, setLevels] = useState<{ id: number; height: number; bitrate: number }[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 is Auto
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const controlsTimeoutRef = useRef<number | null>(null);

  // Load and play channel URL via Hls.js or native player
  useEffect(() => {
    if (!channel || !videoRef.current) return;

    setErrorMsg(null);
    setIsLoading(true);
    setIsPlaying(false);
    setLevels([]);
    setCurrentLevel(-1);

    const video = videoRef.current;

    // Destroy existing Hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const playVideo = async () => {
      try {
        await video.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn("Autoplay block or playback issue, waiting for user interaction:", err);
        setIsPlaying(false);
      }
    };

    if (Hls.isSupported() && channel.url.includes(".m3u8")) {
      const hls = new Hls({
        enableWorker: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;
      hls.loadSource(channel.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setIsLoading(false);
        const qualityLevels = hls.levels.map((lvl, index) => ({
          id: index,
          height: lvl.height,
          bitrate: lvl.bitrate,
        }));
        // Sort levels from high to low
        setLevels(qualityLevels.sort((a, b) => b.height - a.height));
        playVideo();
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        // level switch confirmation
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Fatal network error in Hls.js, trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Fatal media error in Hls.js, trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              console.error("Fatal unrecoverable player error.");
              setErrorMsg("Stream format issue or source offline. Please try another channel.");
              setIsLoading(false);
              if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
              }
              break;
          }
        }
      });

      // Buffering states are handled natively by HTML5 video event listeners below
    } else if (video.canPlayType("application/vnd.apple.mpegurl") || !channel.url.includes(".m3u8")) {
      // Native Safari/iOS playback or non-HLS streams
      video.src = channel.url;
      
      const onLoadedMetadata = () => {
        setIsLoading(false);
        playVideo();
      };
      
      const onError = () => {
        setIsLoading(false);
        setErrorMsg("Failed to stream. This channel may be offline or restricted.");
      };

      video.addEventListener("loadedmetadata", onLoadedMetadata);
      video.addEventListener("error", onError);

      return () => {
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        video.removeEventListener("error", onError);
      };
    } else {
      setIsLoading(false);
      setErrorMsg("Your browser does not support HLS stream playback.");
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel]);

  // Native HTML5 video buffering event listeners to toggle loading spinner
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);
    const handleSeeking = () => setIsLoading(true);
    const handleSeeked = () => setIsLoading(false);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [channel]);

  // Sync volume with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Sync volume persistence
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    localStorage.setItem("iptv_volume", newVolume.toString());
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error("Error entering fullscreen: ", err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false));
    }
  };

  // Monitor fullscreen change from general browser triggers (Esc key, etc.)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Handle Controls fade out after 3 seconds of inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying && !showQualityMenu) {
        setShowControls(false);
      }
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const handleQualitySelect = (levelId: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId;
      setCurrentLevel(levelId);
    }
    setShowQualityMenu(false);
  };

  const handleRetry = () => {
    if (!channel) return;
    setErrorMsg(null);
    setIsLoading(true);
    
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // re-trigger load
    const hls = new Hls({ enableWorker: true });
    hlsRef.current = hls;
    hls.loadSource(channel.url);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setIsLoading(false);
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    });

    hls.on(Hls.Events.ERROR, (evt, dat) => {
      if (dat.fatal) {
        setErrorMsg("Failed to stream. Try connection recovery or select another provider.");
        setIsLoading(false);
      }
    });
  };

  return (
    <div 
      className="relative flex flex-col w-full bg-slate-950 aspect-video rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      id="video-player-container"
    >
      {/* Video Node */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      {/* Screen Placeholder when no channel index */}
      {!channel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-slate-400 z-10 px-4 text-center">
          <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-full mb-4 animate-pulse">
            <Tv className="w-12 h-12 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight font-sans">No Channel Playing</h2>
          <p className="text-sm mt-2 text-slate-400 max-w-sm font-sans leading-relaxed">
            Select a live TV channel from the catalog to begin premium streaming. Customize your favorites for fast access.
          </p>
        </div>
      )}

      {/* Loading overlay spinner */}
      {channel && isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-30 pointer-events-none transition-all">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-3" />
          <p className="text-xs font-mono text-slate-300 tracking-wider font-semibold">ESTABLISHING SECURE DECODER LINK...</p>
          <span className="text-[10px] text-slate-500 tracking-tight mt-1 truncate max-w-xs">{channel.name}</span>
        </div>
      )}

      {/* Error View Frame */}
      {channel && errorMsg && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 z-40 px-6 text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mb-3 animate-bounce" />
          <h3 className="text-md font-bold text-slate-200">Decoder Streaming Interruption</h3>
          <p className="text-xs text-slate-400 max-w-md mt-1 mb-4 leading-relaxed font-mono">
            {errorMsg}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 transition text-slate-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
              id="player-retry-stream"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reconnect Link
            </button>
          </div>
        </div>
      )}

      {/* Premium custom playback controls */}
      {channel && !errorMsg && (
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40 flex flex-col justify-between p-4 transition-all duration-300 z-20 ${
            showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          id="player-live-controls"
        >
          {/* Header Banner inside player */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <span className="bg-rose-600 text-[10px] font-bold text-white px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-rose-600/30">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> Live
              </span>
              <div>
                <h4 className="text-sm font-semibold text-white drop-shadow-md truncate max-w-[240px] md:max-w-md">
                  {channel.name}
                </h4>
                <p className="text-[10px] text-blue-400 font-mono tracking-tight capitalize drop-shadow">
                  {channel.category} • {channel.country}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quality level toggle */}
              {levels.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="p-1.5 bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition border border-slate-800 font-mono text-[10px] flex items-center gap-1.5"
                    title="Select Playback Quality"
                    id="quality-selector-btn"
                  >
                    <Settings className="w-3.5 h-3.5 text-blue-400" />
                    {currentLevel === -1 
                      ? "Auto" 
                      : `${levels.find(l => l.id === currentLevel)?.height || "Auto"}p`
                    }
                  </button>

                  {showQualityMenu && (
                    <div className="absolute right-0 top-full mt-2 w-36 bg-slate-900/95 border border-slate-800 rounded-xl py-1.5 shadow-2xl backdrop-blur-md z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-1 border-b border-slate-800 mb-1">
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Quality</span>
                      </div>
                      <button
                        onClick={() => handleQualitySelect(-1)}
                        className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors flex items-center justify-between ${
                          currentLevel === -1 ? 'bg-blue-600/20 text-blue-400 font-bold' : 'text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        Auto
                      </button>
                      {levels.map((lvl) => (
                        <button
                          key={lvl.id}
                          onClick={() => handleQualitySelect(lvl.id)}
                          className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors flex items-center justify-between ${
                            currentLevel === lvl.id ? 'bg-blue-600/20 text-blue-400 font-bold' : 'text-slate-300 hover:bg-slate-800/60'
                          }`}
                        >
                          <span>{lvl.height}p</span>
                          <span className="text-[9px] text-slate-500 font-normal">{(lvl.bitrate / 1000000).toFixed(1)} Mbps</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Custom Playback Bar controls */}
          <div className="flex items-center justify-between gap-4 mt-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-500 transition text-white rounded-full shadow-lg shadow-blue-500/20 hover:scale-105"
                title={isPlaying ? "Pause Stream" : "Play Stream"}
                id="player-play-pause-btn"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              {/* Volume Slider Section */}
              <div className="flex items-center gap-2 group/volume ml-2">
                <button
                  onClick={toggleMute}
                  className="p-1.5 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg transition"
                  title={isMuted ? "Unmute" : "Mute"}
                  id="player-mute-btn"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-0 scale-x-0 group-hover/volume:w-20 group-hover/volume:scale-x-100 transition-all duration-300 origin-left accent-blue-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
                  title="Volume level"
                />
              </div>
            </div>

            {/* Right utilities: full screen, indicator */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center px-2 py-1 bg-slate-950/80 border border-slate-800 rounded-md gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-slate-300 font-mono tracking-wide uppercase">Streaming Active</span>
              </div>

              <button
                onClick={toggleFullscreen}
                className="p-2 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg transition"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                id="player-fullscreen-btn"
              >
                {isFullscreen ? <Minimize className="w-4.5 h-4.5" /> : <Maximize className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
