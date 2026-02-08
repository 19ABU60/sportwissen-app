import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const OBRIEN_MERKMALE = [
  {
    phase: "Ausgangsstellung",
    merkmale: ["Rücken zur Stoßrichtung", "Kugel am Hals", "Blick nach hinten"]
  },
  {
    phase: "Angleiten (rückwärts)",
    merkmale: ["Flaches Abdrücken nach hinten", "Schwungbein führt", "Körper bleibt tief"]
  },
  {
    phase: "Stoßauslage",
    merkmale: ["Oberkörper 90° zur Stoßrichtung", "Schulterachsenneigung", "Druckbein gebeugt"]
  },
  {
    phase: "Stoß",
    merkmale: ["Drehstreckung", "Kugel beschleunigen", "Abwurf im Moment der vollen Streckung"]
  }
];

export default function OBrien() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    document.title = "O'Brien-Technik | SportWissen";
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
          <Link to="/" className="hover:text-zinc-300">Übersicht</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-amber-400">Zieltechnik</span>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Award className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="font-oswald text-3xl md:text-4xl font-bold tracking-tight uppercase text-white">
            O'Brien-Technik
          </h1>
        </div>
        <p className="text-zinc-400">
          Die Zieltechnik - der vollständige Bewegungsablauf nach Parry O'Brien
        </p>
      </motion.div>

      {/* Video Player */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 mb-8"
      >
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full aspect-video"
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            poster="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            data-testid="obrien-video"
          />

          {/* Play Overlay */}
          {!isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
              onClick={togglePlay}
            >
              <div className="w-20 h-20 rounded-full bg-amber-500/30 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform">
                <Play className="w-10 h-10 text-white ml-1" />
              </div>
            </div>
          )}

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 to-transparent">
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="mb-4"
            />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20 h-10 w-10"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
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
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
              </div>

              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-zinc-400 text-sm mr-2 hidden md:inline">Tempo:</span>
                {[0.25, 0.5, 1, 1.5].map((rate) => (
                  <Button
                    key={rate}
                    size="sm"
                    variant={playbackRate === rate ? "default" : "ghost"}
                    onClick={() => setSpeed(rate)}
                    className={`text-xs md:text-sm px-2 md:px-3 ${
                      playbackRate === rate
                        ? "bg-amber-600 text-white"
                        : "text-white hover:bg-white/20"
                    }`}
                  >
                    {rate}x
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-zinc-800">
          <h2 className="font-oswald text-xl font-bold text-white mb-2">
            Gesamtbewegung - O'Brien-Technik
          </h2>
          <p className="text-zinc-400">
            Die komplette Bewegung von der Ausgangsstellung bis zum Abwurf in Zeitlupe analysieren.
          </p>
          <p className="text-sm text-zinc-500 mt-2">
            Platzhalter-Video - Hier kommt später das echte Demonstrationsvideo
          </p>
        </div>
      </motion.div>

      {/* Phasen-Übersicht */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        {OBRIEN_MERKMALE.map((item, index) => (
          <div
            key={index}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-amber-500/30 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-400 font-oswald font-bold">{index + 1}</span>
              </div>
              <h3 className="font-oswald font-semibold text-white">{item.phase}</h3>
            </div>
            <ul className="space-y-2">
              {item.merkmale.map((merkmal, i) => (
                <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  {merkmal}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6"
      >
        <h3 className="font-oswald text-lg font-semibold text-amber-300 mb-2">
          Über Parry O'Brien
        </h3>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Parry O'Brien (1932-2007) revolutionierte das Kugelstoßen mit seiner Technik, 
          bei der der Athlet mit dem Rücken zur Stoßrichtung startet und sich rückwärts 
          zur Stoßauslage bewegt. Diese Technik ermöglicht einen längeren Beschleunigungsweg 
          und wurde zum Standard im modernen Kugelstoßen.
        </p>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex justify-between items-center"
      >
        <Link to="/videos">
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Zurück: 4. Stoß
          </Button>
        </Link>
        <Link to="/fehler">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white">
            Weiter: Fehlerbilder
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
