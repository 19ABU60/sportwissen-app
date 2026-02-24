import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, ChevronUp, Trash2, Edit3, Save, X,
  Image as ImageIcon, Maximize2
} from "lucide-react";
import { MediaUpload } from "@/components/MediaUpload";
import { VideoRecorder } from "@/components/VideoRecorder";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { Lightbox } from "@/components/Lightbox";
import { toast } from "sonner";

// Fehlerkategorien für jedes Bild
const FEHLER_KATEGORIEN = {
  angleiten: [
    "häufige Fehlerbilder",
    "Fehlerbild 2",
    "Fehlerbild 3"
  ],
  stossauslage: [
    "häufige Fehlerbilder",
    "Fehlerbild 2",
    "Fehlerbild 3"
  ],
  drehstreck: [
    "häufige Fehlerbilder",
    "Fehlerbild 2",
    "Fehlerbild 3"
  ],
  abstoss: [
    "häufige Fehlerbilder",
    "Fehlerbild 2",
    "Fehlerbild 3"
  ]
};

function FehlerDropdown({ kategorien }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(0);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-zinc-700/50 border border-zinc-600 rounded px-2 py-1.5 hover:bg-zinc-700 transition-colors text-left"
      >
        <span className="text-zinc-300 text-xs truncate">
          {kategorien[selected]}
        </span>
        <ChevronDown className={`w-3 h-3 text-zinc-400 flex-shrink-0 ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-600 rounded overflow-hidden z-10 shadow-lg">
          {kategorien.map((kat, index) => (
            <button
              key={index}
              onClick={() => {
                setSelected(index);
                setIsOpen(false);
              }}
              className={`w-full text-left px-2 py-1.5 text-xs transition-colors ${
                selected === index 
                  ? "bg-amber-600 text-white" 
                  : "text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {kat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Droppable Phase Window Component
function PhaseWindow({ 
  bild, 
  droppedFrame, 
  onDrop, 
  onClear,
  onAnalyze,
  onSave,
  isAnalyzing
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  // Debug log
  useEffect(() => {
    if (droppedFrame) {
      console.log(`Phase ${bild.id} received frame:`, droppedFrame);
    }
  }, [droppedFrame, bild.id]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const frame = JSON.parse(data);
        onDrop(bild.id, frame);
        toast.success(`Standbild zu "${bild.title}" hinzugefügt`);
      }
    } catch (err) {
      console.error("Drop error:", err);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-zinc-800/50 border-2 rounded-lg overflow-hidden transition-all ${
          isDragOver 
            ? "border-blue-500 bg-blue-500/10" 
            : droppedFrame 
              ? droppedFrame.saved 
                ? "border-blue-500" 
                : "border-green-500" 
              : "border-zinc-700"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Image Area */}
        <div className="relative aspect-square bg-zinc-900">
          {droppedFrame ? (
            <>
              <img 
                src={droppedFrame.imageUrl} 
                alt={bild.title}
                className="w-full h-full object-cover"
              />
              {/* Status indicator */}
              <div className={`absolute top-1 left-1 text-white text-[10px] px-1.5 py-0.5 rounded ${
                droppedFrame.saved ? "bg-blue-500" : "bg-green-500"
              }`}>
                {droppedFrame.saved ? "✓ Gespeichert" : "✓ Zugewiesen"}
              </div>
              {/* Overlay Actions - always visible on touch */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 flex justify-center gap-2">
                <button
                  onClick={() => setShowLightbox(true)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30"
                  title="Vergrößern"
                >
                  <Maximize2 className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => onAnalyze(bild.id)}
                  className="p-2 bg-blue-500/80 backdrop-blur-sm rounded-full hover:bg-blue-500"
                  title="Analysieren"
                >
                  <Edit3 className="w-4 h-4 text-white" />
                </button>
                {!droppedFrame.saved && (
                  <button
                    onClick={() => onSave(bild.id, droppedFrame)}
                    className="p-2 bg-green-500/80 backdrop-blur-sm rounded-full hover:bg-green-500"
                    title="Speichern"
                  >
                    <Save className="w-4 h-4 text-white" />
                  </button>
                )}
                <button
                  onClick={() => onClear(bild.id)}
                  className="p-2 bg-red-500/80 backdrop-blur-sm rounded-full hover:bg-red-500"
                  title="Entfernen"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 p-2">
              <ImageIcon className="w-8 h-8 mb-1" />
              <p className="text-[10px] text-center">
                {isDragOver ? "Hier ablegen" : "Standbild hierher ziehen"}
              </p>
            </div>
          )}
        </div>
        
        {/* Info Area */}
        <div className="p-2 space-y-2">
          <h3 className="font-oswald text-sm font-semibold text-white">
            {bild.title}
          </h3>
          <FehlerDropdown kategorien={bild.kategorien} />
        </div>
      </motion.div>
      
      {/* Lightbox */}
      {showLightbox && droppedFrame && (
        <Lightbox 
          src={droppedFrame.imageUrl} 
          alt={bild.title}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </>
  );
}

// Analysis Modal with Drawing Canvas
function AnalysisModal({ frame, phaseTitle, onClose, onSave }) {
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
        className="w-full max-w-5xl bg-zinc-900 rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 className="font-oswald text-xl font-bold text-white">
            Fehleranalyse: {phaseTitle}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Speichern
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>
        
        {/* Drawing Canvas */}
        <div className="p-4">
          <DrawingCanvas
            imageSrc={frame.imageUrl}
            imageAlt={phaseTitle}
            title="Markiere Fehler und Korrekturen im Bild"
            tasks={[
              "Markiere den Hauptfehler",
              "Zeichne die korrekte Körperposition ein",
              "Zeige die Bewegungsrichtung"
            ]}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Errors() {
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [capturedFrames, setCapturedFrames] = useState([]);
  const [droppedFrames, setDroppedFrames] = useState({});
  const [analyzingPhase, setAnalyzingPhase] = useState(null);

  useEffect(() => {
    document.title = "Fehlerbilder | SportWissen";
  }, []);

  const bilder = [
    { id: 1, section: "bild1", title: "1. Angleiten", kategorien: FEHLER_KATEGORIEN.angleiten },
    { id: 2, section: "bild2", title: "2. Stoßauslage", kategorien: FEHLER_KATEGORIEN.stossauslage },
    { id: 3, section: "bild3", title: "3. Dreh-Streck-Bewegung", kategorien: FEHLER_KATEGORIEN.drehstreck },
    { id: 4, section: "bild4", title: "4. Abstoß", kategorien: FEHLER_KATEGORIEN.abstoss },
  ];

  const handleFrameCaptured = (frame) => {
    setCapturedFrames(prev => [...prev, frame]);
  };

  const handleDeleteFrame = (frameId) => {
    setCapturedFrames(prev => prev.filter(f => f.id !== frameId));
  };

  const handleDropFrame = (phaseId, frame) => {
    setDroppedFrames(prev => {
      const newState = {
        ...prev,
        [phaseId]: frame
      };
      return newState;
    });
  };

  const handleClearFrame = (phaseId) => {
    setDroppedFrames(prev => {
      const newState = { ...prev };
      delete newState[phaseId];
      return newState;
    });
  };

  const handleAnalyze = (phaseId) => {
    setAnalyzingPhase(phaseId);
  };

  const handleSaveFrame = async (phaseId, frame) => {
    try {
      // Convert base64/dataURL to blob
      const response = await fetch(frame.imageUrl);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      const phaseName = bilder.find(b => b.id === phaseId)?.title || `phase_${phaseId}`;
      formData.append('file', blob, `fehler_${phaseName}_${Date.now()}.jpg`);
      formData.append('page', 'fehleranalyse');
      formData.append('section', `fehler_phase_${phaseId}`);
      formData.append('media_type', 'image');
      
      const uploadResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/media/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (uploadResponse.ok) {
        // Mark as saved
        setDroppedFrames(prev => ({
          ...prev,
          [phaseId]: { ...frame, saved: true }
        }));
        toast.success(`Bild "${phaseName}" gespeichert!`);
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Fehler beim Speichern");
    }
  };

  const handleSaveAnalysis = async () => {
    toast.success("Analyse gespeichert!");
    setAnalyzingPhase(null);
  };

  const analyzingBild = bilder.find(b => b.id === analyzingPhase);
  const analyzingFrame = analyzingPhase ? droppedFrames[analyzingPhase] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="font-oswald text-2xl md:text-3xl font-bold tracking-tight text-white">
          Fehlerbilder erkennen und Bewegungshilfen ableiten
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Nehmen Sie ein Video auf, extrahieren Sie Standbilder und analysieren Sie Bewegungsfehler
        </p>
      </motion.div>

      {/* Phase Windows Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        {bilder.map((bild) => (
          <PhaseWindow
            key={bild.id}
            bild={bild}
            droppedFrame={droppedFrames[bild.id]}
            onDrop={handleDropFrame}
            onClear={handleClearFrame}
            onAnalyze={handleAnalyze}
          />
        ))}
      </motion.div>

      {/* Video Recorder Button - Opens Fullscreen */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={() => setShowVideoRecorder(true)}
          className="w-full flex items-center justify-between bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 hover:bg-blue-500/20 transition-colors mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-oswald text-base font-semibold text-white">
                Video-Aufnahme & Standbild-Extraktion
              </h3>
              <p className="text-xs text-zinc-400">
                Bewegungsabläufe aufnehmen und analysieren
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {capturedFrames.length > 0 && (
              <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                {capturedFrames.length} Bilder
              </span>
            )}
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
        </button>
      </motion.div>

      {/* Fullscreen Video Recorder Overlay */}
      <AnimatePresence>
        {showVideoRecorder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950 flex flex-col"
          >
            {/* Compact Header with Phase Preview */}
            <div className="flex-shrink-0 bg-zinc-900 border-b border-zinc-700 px-3 py-2">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-oswald text-base font-bold text-white">
                  Video-Aufnahme
                </h2>
                <button
                  onClick={() => {
                    setShowVideoRecorder(false);
                    // Clear temporary captured frames when closing
                    setCapturedFrames([]);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Schließen
                </button>
              </div>
              
              {/* Mini Phase Preview - Compact with names */}
              <div className="grid grid-cols-4 gap-1">
                {bilder.map((bild) => (
                  <div 
                    key={bild.id}
                    className={`py-1 px-1 rounded text-center text-[10px] font-medium border ${
                      droppedFrames[bild.id] 
                        ? "border-green-500 bg-green-500/20 text-green-400" 
                        : "border-zinc-600 bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {droppedFrames[bild.id] ? "✓ " : ""}{bild.title.replace(/^\d+\.\s*/, '')}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Video Recorder Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-3">
              <VideoRecorder
                onFrameCaptured={handleFrameCaptured}
                savedFrames={capturedFrames}
                onDeleteFrame={handleDeleteFrame}
                onAssignFrame={(phaseId, frame) => {
                  handleDropFrame(phaseId, frame);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <Link to="/">
          <button className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors text-sm">
            Zur Übersicht
          </button>
        </Link>
      </motion.div>

      {/* Analysis Modal */}
      <AnimatePresence>
        {analyzingPhase && analyzingFrame && analyzingBild && (
          <AnalysisModal
            frame={analyzingFrame}
            phaseTitle={analyzingBild.title}
            onClose={() => setAnalyzingPhase(null)}
            onSave={handleSaveAnalysis}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
