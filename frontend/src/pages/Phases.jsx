import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { GripVertical, Check, X, RotateCcw, Play, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function SortablePhaseItem({ phase, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: phase.id });

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
        phase-item py-2 px-3
        ${isDragging ? "dragging opacity-90" : ""}
      `}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      data-testid={`phase-item-${phase.id}`}
    >
      <div className="phase-number w-6 h-6 text-sm">{index + 1}</div>
      <div className="flex-1">
        <p className="font-medium text-white text-sm">{phase.name}</p>
      </div>
      <GripVertical className="w-4 h-4 text-zinc-500" />
    </motion.div>
  );
}

function PhaseOverlay({ phase }) {
  return (
    <div className="phase-item dragging bg-zinc-800 border-blue-500 py-2 px-3">
      <div className="phase-number w-6 h-6 text-sm">•</div>
      <div className="flex-1">
        <p className="font-medium text-white text-sm">{phase.name}</p>
      </div>
      <GripVertical className="w-5 h-5 text-zinc-500" />
    </div>
  );
}

export default function Phases() {
  const [phases, setPhases] = useState([]);
  const [correctOrder, setCorrectOrder] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    document.title = "Phasen | SportWissen";
    fetchPhases();
  }, []);

  const fetchPhases = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API}/phases`);
      // Shuffle phases for the exercise
      const shuffled = [...response.data.phases].sort(() => Math.random() - 0.5);
      setPhases(shuffled);
      setCorrectOrder(response.data.correct_order);
      setResult(null);
    } catch (error) {
      console.error("Error fetching phases:", error);
      toast.error("Fehler beim Laden der Phasen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      setPhases((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setResult(null);
    }
  };

  const validateOrder = async () => {
    const userOrder = phases.map((p) => p.id);
    try {
      const response = await axios.post(`${API}/validate-phases`, userOrder);
      setResult(response.data);
      
      if (response.data.is_correct) {
        toast.success("Perfekt! Die Reihenfolge stimmt! 🎉");
      } else {
        toast.error("Nicht ganz richtig. Versuche es noch einmal!");
      }
    } catch (error) {
      console.error("Error validating:", error);
      toast.error("Fehler bei der Überprüfung");
    }
  };

  const resetExercise = () => {
    fetchPhases();
  };

  const activePhase = activeId ? phases.find((p) => p.id === activeId) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="font-oswald text-3xl md:text-4xl font-bold tracking-tight uppercase text-white mb-2">
          Phasen des Kugelstoßens
        </h1>
        <p className="text-zinc-400">
          Ordne die Bewegungsphasen in die richtige Reihenfolge!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Drag & Drop Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
        >
          <h2 className="font-oswald text-lg font-semibold uppercase tracking-wide text-zinc-300 mb-6">
            Ziehe die Phasen in die richtige Reihenfolge
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-zinc-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={phases.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3" data-testid="phases-list">
                  {phases.map((phase, index) => (
                    <SortablePhaseItem
                      key={phase.id}
                      phase={phase}
                      index={index}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activePhase ? <PhaseOverlay phase={activePhase} /> : null}
              </DragOverlay>
            </DndContext>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={validateOrder}
              data-testid="check-order-btn"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-oswald uppercase tracking-wider"
            >
              <Check className="w-4 h-4 mr-2" />
              Überprüfen
            </Button>
            <Button
              onClick={resetExercise}
              variant="outline"
              data-testid="reset-btn"
              className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
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
                  mt-6 p-4 rounded-lg flex items-center gap-3
                  ${result.is_correct 
                    ? "bg-green-500/20 border border-green-500/50" 
                    : "bg-red-500/20 border border-red-500/50"
                  }
                `}
                data-testid="result-feedback"
              >
                {result.is_correct ? (
                  <Check className="w-6 h-6 text-green-400" />
                ) : (
                  <X className="w-6 h-6 text-red-400" />
                )}
                <p className={result.is_correct ? "text-green-300" : "text-red-300"}>
                  {result.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Video Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h2 className="font-oswald text-lg font-semibold uppercase tracking-wide text-zinc-300 mb-4">
              Gesamtbewegung (didaktisch reduziert)
            </h2>
            <div className="aspect-video bg-zinc-800 rounded-lg overflow-hidden relative group">
              <video
                className="w-full h-full object-cover"
                poster="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80"
                controls
                data-testid="phase-video"
              >
                <source
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  type="video/mp4"
                />
              </video>
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            </div>
            <p className="text-sm text-zinc-500 mt-3">
              Platzhalter-Video - Hier kommt später das echte Demonstrationsvideo
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="info-card">
              <div className="info-card-header">
                Wesentliche Aspekte
              </div>
              <ul className="space-y-2">
                <li className="info-card-item">• Kugelhaltung</li>
                <li className="info-card-item">• Fußaufsatz</li>
                <li className="info-card-item">• Oberkörperdrehung</li>
                <li className="info-card-item">• Gewichtsverlagerung</li>
              </ul>
            </div>
            <div className="info-card">
              <div className="info-card-header">
                Zur Stoßauslage
              </div>
              <ul className="space-y-2">
                <li className="info-card-item">• Ausgangsstellung</li>
                <li className="info-card-item">• Angleiten</li>
                <li className="info-card-item">• Impulsschritt oder</li>
                <li className="info-card-item">• Nachstellschritt</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
