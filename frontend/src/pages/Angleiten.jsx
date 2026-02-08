import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const VIDEOS = [
  {
    id: "v1",
    title: "Angleiten - Nachstellschritt",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
    description: "Das Angleiten mit Nachstellschritt-Technik",
  },
  {
    id: "v2",
    title: "Angleiten - Impulsschritt",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80",
    description: "Das Angleiten mit Impulsschritt-Technik",
  },
  {
    id: "v3",
    title: "Stoßauslage - Stoß",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
    description: "Von der Stoßauslage zum Stoß",
  },
];

const QUIZ_OPTIONS = [
  "Seitliche Ausgangsstellung",
  "Körper leicht versetzt zur Stoßrichtung ausrichten",
  "Impulsschritt",
  "gesamten Körper flach in Richtung Balken in die Stoßauslage beschleunigen",
  "Landung auf gebeugtem Druckbein",
  "Schulterachsenneigung durch Stemmbein/Druckbein-Systematik",
  "Stoßarm in Verlängerung der SA",
];

function VideoCard({ video, onPlay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors cursor-pointer group"
      onClick={() => onPlay(video)}
      data-testid={`video-card-${video.id}`}
    >
      <div className="aspect-video relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-oswald text-lg font-semibold text-white mb-1">
          {video.title}
        </h3>
        <p className="text-sm text-zinc-400">{video.description}</p>
      </div>
    </motion.div>
  );
}

function VideoPlayer({ video, onClose }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

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
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl bg-zinc-900 rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full aspect-video"
            src={video.url}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            data-testid="video-player"
          />
          
          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
            {/* Progress Bar */}
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="mb-4"
              data-testid="video-progress"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                  data-testid="play-pause-btn"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={restart}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
              </div>
              
              {/* Speed Controls */}
              <div className="flex items-center gap-2">
                {[0.25, 0.5, 1, 1.5].map((rate) => (
                  <Button
                    key={rate}
                    size="sm"
                    variant={playbackRate === rate ? "default" : "ghost"}
                    onClick={() => setSpeed(rate)}
                    className={`text-xs px-2 ${
                      playbackRate === rate
                        ? "bg-blue-600 text-white"
                        : "text-white hover:bg-white/20"
                    }`}
                    data-testid={`speed-${rate}x`}
                  >
                    {rate}x
                  </Button>
                ))}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-zinc-800">
          <h3 className="font-oswald text-xl font-bold text-white">{video.title}</h3>
          <p className="text-zinc-400 mt-1">{video.description}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Angleiten() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    document.title = "Angleiten | SportWissen";
  }, []);

  const toggleOption = (index) => {
    setSelectedOptions((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
          <Link to="/" className="hover:text-zinc-300">Übersicht</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-zinc-300">Phase 2</span>
        </div>
        <h1 className="font-oswald text-3xl md:text-4xl font-bold tracking-tight uppercase text-white mb-2">
          2. Angleiten
        </h1>
        <p className="text-zinc-400">
          Videos und Übungen zum Angleiten - Nachstellschritt und Impulsschritt (Didaktische Reduktion)
        </p>
      </motion.div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {VIDEOS.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <VideoCard video={video} onPlay={setSelectedVideo} />
          </motion.div>
        ))}
      </div>

      {/* Quiz Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
      >
        <h2 className="font-oswald text-xl font-semibold uppercase tracking-wide text-white mb-2">
          Impulsschritt oder Nachstellschritt
        </h2>
        <p className="text-zinc-400 mb-6">
          Wähle die Merkmale aus, die zur korrekten Ausführung gehören:
        </p>

        <div className="space-y-3">
          {QUIZ_OPTIONS.map((option, index) => (
            <button
              key={index}
              onClick={() => toggleOption(index)}
              className={`
                w-full text-left quiz-option flex items-center gap-3
                ${selectedOptions.includes(index) ? "selected" : ""}
              `}
              data-testid={`quiz-option-${index}`}
            >
              <div
                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${selectedOptions.includes(index)
                    ? "border-blue-500 bg-blue-500"
                    : "border-zinc-600"
                  }
                `}
              >
                {selectedOptions.includes(index) && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <span className="text-zinc-200">{option}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="info-card"
        >
          <div className="info-card-header">Die Stemmphase dient</div>
          <div className="grid grid-cols-4 gap-2 text-zinc-400 text-sm">
            <span>kör</span>
            <span>Auf</span>
            <span>Ober</span>
            <span>des</span>
            <span>rich</span>
            <span>dem</span>
            <span>ten</span>
            <span>pers</span>
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            (Lückentext-Übung - später interaktiv)
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4"
        >
          <h3 className="font-oswald text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-3">
            Steuern von Übungsabläufen
          </h3>
          <Button
            variant="outline"
            className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-700"
            data-testid="control-exercises-btn"
          >
            Übungen starten
          </Button>
        </motion.div>
      </div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 flex justify-between items-center"
      >
        <Link to="/ausgangsstellung">
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Zurück: 1. Ausgangsstellung
          </Button>
        </Link>
        <Link to="/technik">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Weiter: 3. Stoßauslage
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </motion.div>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}
