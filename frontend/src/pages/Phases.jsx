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
import { GripVertical, Check, X, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Phasen für Nachstellschritt seitwärts
const PHASES_NACHSTELLSCHRITT = [
  { id: "ns_1", name: "Ausgangsstellung", description: "Seitlich zur Stoßrichtung stehen, Kugel am Hals", order: 1 },
  { id: "ns_2", name: "Angleiten", description: "Aus dem Nachstellschritt in die Stoßauslage", order: 2 },
  { id: "ns_3", name: "Stoßauslage", description: "Momentum des Übergangs vom Angleiten zum Abstoßen", order: 3 },
  { id: "ns_4", name: "Stoß", description: "Hauptfunktionsphase", order: 4 },
];

const CORRECT_ORDER_NACHSTELLSCHRITT = ["ns_1", "ns_2", "ns_3", "ns_4"];

// Phasen für O'Brien-Technik
const PHASES_OBRIEN = [
  { id: "ob_1", name: "Ausgangsstellung", description: "Rücken zur Stoßrichtung, Kugel am Hals", order: 1 },
  { id: "ob_2", name: "Angleiten", description: "Rückwärtige Bewegung in die Stoßauslage", order: 2 },
  { id: "ob_3", name: "Stoßauslage", description: "Momentum des Übergangs vom Angleiten zum Abstoßen", order: 3 },
  { id: "ob_4", name: "Stoß", description: "Hauptfunktionsphase", order: 4 },
];

const CORRECT_ORDER_OBRIEN = ["ob_1", "ob_2", "ob_3", "ob_4"];

function SortablePhaseItem({ phase, index, color = "blue" }) {
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

  const colorClasses = color === "amber" 
    ? "bg-amber-500/20 text-amber-400" 
    : "bg-blue-500/20 text-blue-400";

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
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      data-testid={`phase-item-${phase.id}`}
    >
      <div className={`phase-number w-6 h-6 text-sm ${colorClasses}`}>{index + 1}</div>
      <div className="flex-1">
        <p className="font-medium text-white text-sm">{phase.name}</p>
        {phase.description && (
          <p className="text-xs text-zinc-400 mt-0.5">{phase.description}</p>
        )}
      </div>
      <GripVertical className="w-4 h-4 text-zinc-500" />
    </motion.div>
  );
}

function PhaseOverlay({ phase, color = "blue" }) {
  const colorClasses = color === "amber" 
    ? "bg-amber-500/20 text-amber-400" 
    : "bg-blue-500/20 text-blue-400";

  return (
    <div className="phase-item dragging bg-zinc-800 border-blue-500 py-2 px-3">
      <div className={`phase-number w-6 h-6 text-sm ${colorClasses}`}>•</div>
      <div className="flex-1">
        <p className="font-medium text-white text-sm">{phase.name}</p>
        {phase.description && (
          <p className="text-xs text-zinc-400 mt-0.5">{phase.description}</p>
        )}
      </div>
      <GripVertical className="w-4 h-4 text-zinc-500" />
    </div>
  );
}

// Reusable Drag & Drop Section Component
function PhaseSection({ 
  title, 
  phases, 
  setPhases, 
  correctOrder, 
  color = "blue",
  isOpen,
  onToggle,
  testId
}) {
  const [activeId, setActiveId] = useState(null);
  const [result, setResult] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  const validateOrder = () => {
    const userOrder = phases.map((p) => p.id);
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
    
    setResult({
      is_correct: isCorrect,
      message: isCorrect ? "Perfekt! Die Reihenfolge stimmt!" : "Nicht ganz richtig. Versuche es noch einmal!"
    });

    if (isCorrect) {
      toast.success("Perfekt! Die Reihenfolge stimmt! 🎉");
    } else {
      toast.error("Nicht ganz richtig. Versuche es noch einmal!");
    }
  };

  const resetExercise = () => {
    const shuffled = [...phases].sort(() => Math.random() - 0.5);
    setPhases(shuffled);
    setResult(null);
  };

  const activePhase = activeId ? phases.find((p) => p.id === activeId) : null;

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl">
      {/* Rollmenü Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-zinc-700/30 transition-colors rounded-xl"
        data-testid={testId}
      >
        <h2 className="font-oswald text-sm font-semibold uppercase tracking-wide text-zinc-200 text-left">
          {title}
        </h2>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-zinc-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-zinc-400 flex-shrink-0" />
        )}
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              <p className="text-xs text-zinc-400 mb-3">
                Bringe sie in die richtige Reihenfolge!
              </p>

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
                  <div className="space-y-2">
                    {phases.map((phase, index) => (
                      <SortablePhaseItem
                        key={phase.id}
                        phase={phase}
                        index={index}
                        color={color}
                      />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activePhase ? <PhaseOverlay phase={activePhase} color={color} /> : null}
                </DragOverlay>
              </DndContext>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={validateOrder}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-oswald uppercase tracking-wider text-sm"
                  size="sm"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Überprüfen
                </Button>
                <Button
                  onClick={resetExercise}
                  variant="outline"
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
    </div>
  );
}

export default function Phases() {
  const [showNachstellschritt, setShowNachstellschritt] = useState(false);
  const [showOBrien, setShowOBrien] = useState(false);
  const [phasesNachstellschritt, setPhasesNachstellschritt] = useState([]);
  const [phasesOBrien, setPhasesOBrien] = useState([]);

  useEffect(() => {
    document.title = "Phasenstruktur | SportWissen";
    // Shuffle phases on load
    setPhasesNachstellschritt([...PHASES_NACHSTELLSCHRITT].sort(() => Math.random() - 0.5));
    setPhasesOBrien([...PHASES_OBRIEN].sort(() => Math.random() - 0.5));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="font-oswald text-2xl md:text-3xl font-bold tracking-tight uppercase text-white mb-2">
          Phasenstruktur
        </h1>
        <p className="text-zinc-400 text-sm">
          Ordne die Bewegungsphasen in die richtige Reihenfolge
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Linke Spalte: Beide Rollmenüs */}
        <div className="space-y-4">
          {/* 1. Nachstellschritt seitwärts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PhaseSection
              title="Phasen des Stoßes aus dem Nachstellschritt seitwärts"
              phases={phasesNachstellschritt}
              setPhases={setPhasesNachstellschritt}
              correctOrder={CORRECT_ORDER_NACHSTELLSCHRITT}
              color="blue"
              isOpen={showNachstellschritt}
              onToggle={() => setShowNachstellschritt(!showNachstellschritt)}
              testId="toggle-nachstellschritt"
            />
          </motion.div>

          {/* 2. O'Brien-Technik */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PhaseSection
              title="Phasen des Stoßes - O'Brien-Technik"
              phases={phasesOBrien}
              setPhases={setPhasesOBrien}
              correctOrder={CORRECT_ORDER_OBRIEN}
              color="amber"
              isOpen={showOBrien}
              onToggle={() => setShowOBrien(!showOBrien)}
              testId="toggle-obrien"
            />
          </motion.div>
        </div>

        {/* Rechte Spalte: Video und Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <h2 className="font-oswald text-base font-semibold uppercase tracking-wide text-zinc-200 mb-3">
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
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Platzhalter-Video
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <div className="text-xs font-oswald font-semibold tracking-wide text-zinc-400 mb-2 pb-2 border-b border-zinc-700">
                In die Stoßauslage
              </div>
              <ul className="space-y-1 text-sm text-zinc-300">
                <li className="flex"><span className="mr-1">•</span><span>Ausgangsstellung</span></li>
                <li className="flex"><span className="mr-1">•</span><span>Angleiten</span></li>
                <li className="flex"><span className="mr-1">•</span><span>Stoßauslage</span></li>
              </ul>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <div className="text-xs font-oswald font-semibold tracking-wide text-zinc-400 mb-2 pb-2 border-b border-zinc-700">
                Wesentliche Aspekte
              </div>
              <ul className="space-y-1 text-sm text-zinc-300">
                <li className="flex"><span className="mr-1">•</span><span>Kugelhaltung</span></li>
                <li className="flex"><span className="mr-1">•</span><span>Oberkörper absenken</span></li>
                <li className="flex"><span className="mr-1">•</span><span>flach nach hinten-unten abdrücken</span></li>
                <li className="flex"><span className="mr-1">•</span><span>bei gleichzeitiger Oberkörperdrehung</span></li>
                <li className="flex"><span className="mr-1">•</span><span>mit Gewichtsverlagerung auf das Druckbein</span></li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
