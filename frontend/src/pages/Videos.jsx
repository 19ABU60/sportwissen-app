import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const MAIN_VIDEO = {
  id: "main",
  title: "Gesamtbewegung (didaktisch reduziert)",
  url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
  description: "Die komplette O'Brien-Technik in der Übersicht",
};

export default function Videos() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    document.title = "Videos | SportWissen";
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const prog = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(prog);
    }
  };

  const handleSeek = (value) => {
    if (videoRef.current) {
      const time = (value[0] / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
      setProgress(value[0]);
    }
  };

  const setSpeed = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const restart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setProgress(0);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="font-oswald text-3xl md:text-4xl font-bold tracking-tight uppercase text-white mb-2">
          Gesamtbewegung
        </h1>
        <p className="text-zinc-400">
          Die O'Brien-Technik im Überblick - Zeitlupe und verschiedene Perspektiven
        </p>
      </motion.div>

      {/* Main Video Player */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800"
      >
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full aspect-video"
            src={MAIN_VIDEO.url}
            poster={MAIN_VIDEO.thumbnail}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            data-testid="main-video-player"
          />

          {/* Play Overlay */}
          {!isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
              onClick={togglePlay}
            >
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform">
                <Play className="w-10 h-10 text-white ml-1" />
              </div>
            </div>
          )}

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 to-transparent">
            {/* Progress Bar */}
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="mb-4"
              data-testid="video-progress-slider"
            />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20 h-12 w-12"
                  data-testid="main-play-btn"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={restart}
                  className="text-white hover:bg-white/20"
                  data-testid="restart-btn"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                  data-testid="mute-btn"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
              </div>

              {/* Speed Controls */}
              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-zinc-400 text-sm mr-2 hidden md:inline">
                  Geschwindigkeit:
                </span>
                {[0.25, 0.5, 1, 1.5].map((rate) => (
                  <Button
                    key={rate}
                    size="sm"
                    variant={playbackRate === rate ? "default" : "ghost"}
                    onClick={() => setSpeed(rate)}
                    className={`text-xs md:text-sm px-2 md:px-3 ${
                      playbackRate === rate
                        ? "bg-blue-600 text-white"
                        : "text-white hover:bg-white/20"
                    }`}
                    data-testid={`speed-btn-${rate}`}
                  >
                    {rate}x
                  </Button>
                ))}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20 ml-2"
                  data-testid="fullscreen-btn"
                >
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="p-4 md:p-6 border-t border-zinc-800">
          <h2 className="font-oswald text-xl md:text-2xl font-bold text-white mb-2">
            {MAIN_VIDEO.title}
          </h2>
          <p className="text-zinc-400">{MAIN_VIDEO.description}</p>
          <p className="text-sm text-zinc-500 mt-3">
            Platzhalter-Video - Hier kommt später das echte Demonstrationsvideo
          </p>
        </div>
      </motion.div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h3 className="font-oswald text-lg font-semibold uppercase tracking-wide text-zinc-300 mb-4">
            Tipps zur Videoanalyse
          </h3>
          <ul className="space-y-3 text-zinc-400">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">1.</span>
              <span>Nutze die Zeitlupe (0.25x) für Details</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">2.</span>
              <span>Achte auf die Phasenübergänge</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">3.</span>
              <span>Beobachte die Körperhaltung in der Stoßauslage</span>
            </li>
          </ul>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h3 className="font-oswald text-lg font-semibold uppercase tracking-wide text-zinc-300 mb-4">
            Fokuspunkte
          </h3>
          <div className="space-y-2">
            <div className="p-3 bg-zinc-800/50 rounded-lg text-zinc-300">
              Oberkörperdrehung zur Stoßrichtung
            </div>
            <div className="p-3 bg-zinc-800/50 rounded-lg text-zinc-300">
              Druckbein-Stemmbein-Systematik
            </div>
            <div className="p-3 bg-zinc-800/50 rounded-lg text-zinc-300">
              Schulterachsenneigung
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
