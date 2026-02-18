import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, 
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  GripVertical, Check, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const VIDEOS = [
  {
    id: "v1",
    title: "Nachstellschritt",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
    description: "Das Angleiten mit Nachstellschritt-Technik",
  },
  {
    id: "v3",
    title: "Stoßauslage - Stoß",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
    description: "Von der Stoßauslage zum Stoß",
  },
];

// Merkmale mit korrekter Reihenfolge
const MERKMALE_DATA = [
  { id: "m1", text: "Seitliche Ausgangsstellung", order: 1 },
  { id: "m2", text: "Körper leicht versetzt zur Stoßrichtung ausrichten", order: 2 },
  { id: "m3", text: "Nachstellschritt flach ausführen", order: 3 },
  { id: "m4", text: "beim Nachstellschritt das Körpergewicht auf das hintere Bein (Druckbein) verlagern", order: 4 },
  { id: "m5", text: "Landung auf gebeugtem Druckbein", order: 5 },
  { id: "m6", text: "Schulterachsenneigung durch vollständige Gewichtsverlagerung auf das Druckbein", order: 6 },
  { id: "m7", text: "Stemmbein leicht gebeugt mit der Fußaußenkante gegen den Balken drücken", order: 7 },
  { id: "m8", text: "Stoßarm am Ende der Stoßauslage in Verlängerung der Schulterachse ausgerichtet", order: 8 },
];

const CORRECT_ORDER = ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8"];

// Sortable Item Component
function SortableMerkmalItem({ merkmal, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: merkmal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 p-2 bg-zinc-800/80 border border-zinc-700 rounded-lg cursor-grab
        ${isDragging ? "opacity-90 border-blue-500 shadow-lg" : "hover:border-zinc-600"}
      `}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0">
        <span className="text-blue-400 text-xs font-medium">{index + 1}</span>
      </div>
      <span className="text-zinc-200 text-sm flex-1">{merkmal.text}</span>
      <GripVertical className="w-4 h-4 text-zinc-500 flex-shrink-0" />
    </motion.div>
  );
}

function MerkmalOverlay({ merkmal }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-zinc-800 border border-blue-500 rounded-lg shadow-xl">
      <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0">
        <span className="text-blue-400 text-xs font-medium">•</span>
      </div>
      <span className="text-zinc-200 text-sm flex-1">{merkmal.text}</span>
      <GripVertical className="w-4 h-4 text-zinc-500 flex-shrink-0" />
    </div>
  );
}

function VideoCard({ video, onPlay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors cursor-pointer group"
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
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-white ml-1" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-oswald text-base font-semibold text-white mb-1">
          {video.title}
        </h3>
        <p className="text-xs text-zinc-400">{video.description}</p>
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
          />
          
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="mb-4"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
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
              
              <div className="flex items-center gap-2">
                {[0.25, 0.5, 1, 1.5].map((rate) => (
                  <Button
                    key={rate}
                    size="sm"
                    variant={playbackRate === rate ? "default" : "ghost"}
                    onClick={() => setSpeed(rate)}
                    className={`text-xs px-2 ${
                      playbackRate === rate ? "bg-blue-600 text-white" : "text-white hover:bg-white/20"
                    }`}
                  >
                    {rate}x
                  </Button>
                ))}
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
  const [showMerkmale, setShowMerkmale] = useState(false);
  const [merkmale, setMerkmale] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [result, setResult] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    document.title = "Angleiten | SportWissen";
    // Shuffle merkmale on load
    const shuffled = [...MERKMALE_DATA].sort(() => Math.random() - 0.5);
    setMerkmale(shuffled);
  }, []);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      setMerkmale((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setResult(null);
    }
  };

  const validateOrder = () => {
    const userOrder = merkmale.map((m) => m.id);
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(CORRECT_ORDER);
    
    setResult({
      is_correct: isCorrect,
      message: isCorrect 
        ? "Perfekt! Die Reihenfolge stimmt!" 
        : "Nicht ganz richtig. Versuche es noch einmal!"
    });
    
    if (isCorrect) {
      toast.success("Perfekt! Die Reihenfolge stimmt! 🎉");
    } else {
      toast.error("Nicht ganz richtig. Versuche es noch einmal!");
    }
  };

  const resetExercise = () => {
    const shuffled = [...MERKMALE_DATA].sort(() => Math.random() - 0.5);
    setMerkmale(shuffled);
    setResult(null);
  };

  const activeMerkmal = activeId ? merkmale.find((m) => m.id === activeId) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
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
          Videos und Übungen zum Angleiten - Nachstellschritt (Didaktische Reduktion)
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Videos */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {VIDEOS.map((video, index) => (
            <VideoCard key={video.id} video={video} onPlay={setSelectedVideo} />
          ))}
        </motion.div>

        {/* Right Column - Merkmale Drag & Drop */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4"
        >
          {/* Rollmenü Header */}
          <button
            onClick={() => setShowMerkmale(!showMerkmale)}
            className="w-full flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg hover:bg-zinc-700 transition-colors"
            data-testid="toggle-merkmale"
          >
            <div>
              <h2 className="font-oswald text-base font-semibold uppercase tracking-wide text-zinc-200">
                Nachstellschritt
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Bringe die Merkmale in eine chronologische Reihenfolge!
              </p>
            </div>
            {showMerkmale ? (
              <ChevronUp className="w-5 h-5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-400" />
            )}
          </button>

          {/* Collapsible Merkmale Liste */}
          <AnimatePresence>
            {showMerkmale && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={merkmale.map((m) => m.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2" data-testid="merkmale-list">
                        {merkmale.map((merkmal, index) => (
                          <SortableMerkmalItem
                            key={merkmal.id}
                            merkmal={merkmal}
                            index={index}
                          />
                        ))}
                      </div>
                    </SortableContext>

                    <DragOverlay>
                      {activeMerkmal ? <MerkmalOverlay merkmal={activeMerkmal} /> : null}
                    </DragOverlay>
                  </DndContext>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4">
                    <Button
                      onClick={validateOrder}
                      data-testid="check-merkmale-btn"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-oswald uppercase tracking-wider text-sm"
                      size="sm"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Überprüfen
                    </Button>
                    <Button
                      onClick={resetExercise}
                      variant="outline"
                      data-testid="reset-merkmale-btn"
                      className="border-zinc-600 hover:bg-zinc-700 text-zinc-300"
                      size="sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Result Feedback */}
                  <AnimatePresence>
                    {result && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`
                          mt-4 p-3 rounded-lg flex items-center gap-3
                          ${result.is_correct 
                            ? "bg-green-500/20 border border-green-500/50" 
                            : "bg-red-500/20 border border-red-500/50"
                          }
                        `}
                        data-testid="merkmale-result"
                      >
                        {result.is_correct ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <X className="w-5 h-5 text-red-400" />
                        )}
                        <p className={`text-sm ${result.is_correct ? "text-green-300" : "text-red-300"}`}>
                          {result.message}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
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
      <AnimatePresence>
        {selectedVideo && (
          <VideoPlayer
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
