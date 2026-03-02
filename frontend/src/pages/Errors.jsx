import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, Trash2, Edit3, Save, X, Upload,
  Image as ImageIcon, Maximize2, FileText, FolderOpen
} from "lucide-react";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { Lightbox } from "@/components/Lightbox";
import { VideoRecorder } from "@/components/VideoRecorder";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL || "";

const FEHLER_KATEGORIEN = [
  "häufige Fehlerbilder",
  "Fehlerbild 2",
  "Fehlerbild 3"
];

function DeleteConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-zinc-800 rounded-xl p-6 max-w-sm w-full border border-zinc-600"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-white text-sm mb-4">{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors">
            Abbrechen
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
            Löschen
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function LibraryPickerModal({ onSelect, onClose }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch(`${API_URL}/api/media/list/all`);
        if (response.ok) {
          const data = await response.json();
          setMedia(data.media || []);
        }
      } catch (err) {
        console.error("Error fetching media:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-zinc-700 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h3 className="font-oswald text-lg font-bold text-white">Aus Medienverwaltung wählen</h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-700 rounded">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-400 text-sm">Medien werden geladen...</p>
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">Keine Medien in der Medienverwaltung</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {media.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="aspect-square bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 hover:border-blue-500 transition-colors group relative"
                  data-testid={`library-item-${item.id}`}
                >
                  {item.media_type === "video" ? (
                    item.thumbnail_url ? (
                      <>
                        <img
                          src={`${API_URL}${item.thumbnail_url}`}
                          alt={item.filename}
                          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-transparent border-l-white ml-0.5" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center mx-auto mb-1">
                            <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-transparent border-l-zinc-400 ml-0.5" />
                          </div>
                          <span className="text-[9px] text-zinc-500">Video</span>
                        </div>
                      </div>
                    )
                  ) : (
                    <img
                      src={`${API_URL}${item.url}`}
                      alt={item.filename}
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                  )}
                  <span className={`absolute top-1 right-1 text-[8px] px-1 py-0.5 rounded ${
                    item.media_type === "video" ? "bg-blue-500/80 text-white" : "bg-green-500/80 text-white"
                  }`}>
                    {item.media_type === "video" ? "Video" : "Bild"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function PhaseWindow({ bild, onAnalyze }) {
  const [selectedKategorie, setSelectedKategorie] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [slots, setSlots] = useState({});
  const [showLightbox, setShowLightbox] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [description, setDescription] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const slotKey = `${bild.id}_${selectedKategorie}`;
  const currentSlot = slots[slotKey] || null;

  // Load saved media from backend on mount
  useEffect(() => {
    const loadSavedMedia = async () => {
      for (let i = 0; i < FEHLER_KATEGORIEN.length; i++) {
        try {
          const section = `fehler_${bild.id}_${i}`;
          const response = await fetch(`${API_URL}/api/media/fehleranalyse/${section}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.url) {
              setSlots(prev => ({
                ...prev,
                [`${bild.id}_${i}`]: {
                  imageUrl: `${API_URL}${data.url}`,
                  type: data.media_type || "image",
                  fileName: data.filename,
                  description: data.description || "",
                  saved: true,
                  mediaId: data.id
                }
              }));
            }
          }
        } catch (err) {
          // No saved media for this slot
        }
      }
    };
    loadSavedMedia();
  }, [bild.id]);

  useEffect(() => {
    setDescription(currentSlot?.description || "");
    setIsEditingDesc(false);
  }, [selectedKategorie, currentSlot?.description]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) { toast.error("Nur Bild- oder Videodateien erlaubt"); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setSlots(prev => ({
        ...prev,
        [slotKey]: {
          imageUrl: ev.target.result,
          type: isImage ? "image" : "video",
          fileName: file.name,
          description: prev[slotKey]?.description || "",
          saved: false
        }
      }));
      toast.success(`${isImage ? "Bild" : "Video"} geladen`);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleLibrarySelect = (item) => {
    setSlots(prev => ({
      ...prev,
      [slotKey]: {
        imageUrl: `${API_URL}${item.url}`,
        type: item.media_type || "image",
        fileName: item.filename,
        description: prev[slotKey]?.description || "",
        saved: false,
        fromLibrary: true
      }
    }));
    setShowLibrary(false);
    toast.success("Bild aus Medienverwaltung geladen");
  };

  const handleDropFrame = (frame) => {
    setSlots(prev => ({
      ...prev,
      [slotKey]: {
        ...frame,
        description: prev[slotKey]?.description || "",
        saved: false
      }
    }));
    toast.success(`Standbild zu "${bild.title}" hinzugefügt`);
  };

  const handleClear = async () => {
    const slot = slots[slotKey];
    if (slot?.mediaId) {
      try {
        await fetch(`${API_URL}/api/media/${slot.mediaId}`, { method: 'DELETE' });
      } catch (err) {
        console.error("Delete from server error:", err);
      }
    }
    setSlots(prev => {
      const newState = { ...prev };
      delete newState[slotKey];
      return newState;
    });
    setDescription("");
    setIsEditingDesc(false);
    setShowDeleteConfirm(false);
    toast.success("Analyse gelöscht");
  };

  const handleSaveDescription = () => {
    setSlots(prev => ({
      ...prev,
      [slotKey]: { ...prev[slotKey], description }
    }));
    setIsEditingDesc(false);
    toast.success("Beschreibung gespeichert");
  };

  const handleSaveToLibrary = async () => {
    if (!currentSlot) return;
    try {
      let blob;
      const imgUrl = currentSlot.imageUrl;
      if (imgUrl.startsWith("data:")) {
        const response = await fetch(imgUrl);
        blob = await response.blob();
      } else {
        const response = await fetch(imgUrl);
        blob = await response.blob();
      }
      const formData = new FormData();
      const katName = FEHLER_KATEGORIEN[selectedKategorie];
      formData.append('file', blob, `fehler_${bild.title}_${katName}_${Date.now()}.jpg`);
      formData.append('page', 'fehleranalyse');
      formData.append('section', `fehler_${bild.id}_${selectedKategorie}`);
      formData.append('media_type', currentSlot.type || 'image');

      const uploadResponse = await fetch(`${API_URL}/api/media/upload`, {
        method: 'POST',
        body: formData
      });

      if (uploadResponse.ok) {
        const result = await uploadResponse.json();
        setSlots(prev => ({
          ...prev,
          [slotKey]: { ...prev[slotKey], saved: true, mediaId: result.id }
        }));
        toast.success(`"${katName}" in Medienverwaltung gespeichert`);
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Fehler beim Speichern");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-zinc-800/50 border-2 rounded-lg overflow-hidden transition-all ${
          isDragOver ? "border-blue-500 bg-blue-500/10"
          : currentSlot
            ? currentSlot.saved ? "border-blue-500" : "border-green-500"
            : "border-zinc-700"
        }`}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          try {
            const data = e.dataTransfer.getData('application/json');
            if (data) handleDropFrame(JSON.parse(data));
          } catch (err) { console.error("Drop error:", err); }
        }}
        data-testid={`phase-window-${bild.id}`}
      >
        {/* Image Area */}
        <div className="relative aspect-square bg-zinc-900">
          {currentSlot ? (
            <>
              <img src={currentSlot.imageUrl} alt={bild.title} className="w-full h-full object-cover" />
              <div className={`absolute top-1 left-1 text-white text-[10px] px-1.5 py-0.5 rounded ${
                currentSlot.saved ? "bg-blue-500" : "bg-green-500"
              }`}>
                {currentSlot.saved ? "Gespeichert" : "Geladen"}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 flex justify-center gap-2">
                <button onClick={() => setShowLightbox(true)} className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30" title="Vergrößern" data-testid={`zoom-btn-${bild.id}`}>
                  <Maximize2 className="w-4 h-4 text-white" />
                </button>
                <button onClick={() => onAnalyze(bild.id, currentSlot)} className="p-2 bg-blue-500/80 backdrop-blur-sm rounded-full hover:bg-blue-500" title="Analysieren" data-testid={`analyze-btn-${bild.id}`}>
                  <Edit3 className="w-4 h-4 text-white" />
                </button>
                {!currentSlot.saved && (
                  <button onClick={handleSaveToLibrary} className="p-2 bg-green-500/80 backdrop-blur-sm rounded-full hover:bg-green-500" title="In Medienverwaltung speichern" data-testid={`save-btn-${bild.id}`}>
                    <Save className="w-4 h-4 text-white" />
                  </button>
                )}
                <button onClick={() => setShowDeleteConfirm(true)} className="p-2 bg-red-500/80 backdrop-blur-sm rounded-full hover:bg-red-500" title="Entfernen" data-testid={`delete-btn-${bild.id}`}>
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 p-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center gap-1 py-3 hover:text-zinc-300 transition-colors cursor-pointer"
                data-testid={`upload-area-${bild.id}`}
              >
                <Upload className="w-7 h-7" />
                <span className="text-[10px]">{isDragOver ? "Hier ablegen" : "Bild hochladen"}</span>
              </button>
              <button
                onClick={() => setShowLibrary(true)}
                className="w-full flex items-center justify-center gap-1 py-2 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer border-t border-zinc-800"
                data-testid={`library-btn-${bild.id}`}
              >
                <FolderOpen className="w-4 h-4" />
                <span className="text-[10px]">Aus Medienverwaltung</span>
              </button>
              <p className="text-[9px] text-zinc-600 mt-1">oder Standbild hierher ziehen</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />
        </div>

        {/* Info Area */}
        <div className="p-2 space-y-2">
          <h3 className="font-oswald text-sm font-semibold text-white">{bild.title}</h3>

          {/* Kategorie Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between bg-zinc-700/50 border border-zinc-600 rounded px-2 py-1.5 hover:bg-zinc-700 transition-colors text-left"
              data-testid={`kategorie-dropdown-${bild.id}`}
            >
              <span className="text-zinc-300 text-xs truncate">{FEHLER_KATEGORIEN[selectedKategorie]}</span>
              <ChevronDown className={`w-3 h-3 text-zinc-400 flex-shrink-0 ml-1 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-600 rounded overflow-hidden z-10 shadow-lg">
                {FEHLER_KATEGORIEN.map((kat, index) => {
                  const hasContent = !!slots[`${bild.id}_${index}`];
                  return (
                    <button
                      key={index}
                      onClick={() => { setSelectedKategorie(index); setIsDropdownOpen(false); }}
                      className={`w-full text-left px-2 py-1.5 text-xs transition-colors flex items-center justify-between ${
                        selectedKategorie === index ? "bg-amber-600 text-white" : "text-zinc-300 hover:bg-zinc-700"
                      }`}
                    >
                      <span>{kat}</span>
                      {hasContent && <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Description Area */}
          {currentSlot && (
            <div className="space-y-1">
              {isEditingDesc ? (
                <div className="space-y-1">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Fehlerbeschreibung eingeben..."
                    className="w-full bg-zinc-700/50 border border-zinc-600 rounded px-2 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 resize-none focus:outline-none focus:border-amber-500"
                    rows={3}
                    autoFocus
                    data-testid={`desc-input-${bild.id}`}
                  />
                  <div className="flex gap-1">
                    <button onClick={handleSaveDescription} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] py-1 rounded transition-colors">
                      Speichern
                    </button>
                    <button onClick={() => { setIsEditingDesc(false); setDescription(currentSlot.description || ""); }} className="px-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-[10px] py-1 rounded transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingDesc(true)}
                  className="w-full text-left bg-zinc-700/30 border border-zinc-700 rounded px-2 py-1.5 hover:bg-zinc-700/50 transition-colors"
                  data-testid={`desc-toggle-${bild.id}`}
                >
                  {currentSlot.description ? (
                    <p className="text-[10px] text-zinc-300 line-clamp-2">{currentSlot.description}</p>
                  ) : (
                    <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Fehlerbeschreibung hinzufügen
                    </p>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {showLightbox && currentSlot && (
        <Lightbox src={currentSlot.imageUrl} alt={bild.title} onClose={() => setShowLightbox(false)} />
      )}

      <AnimatePresence>
        {showDeleteConfirm && (
          <DeleteConfirmModal
            message={`"${FEHLER_KATEGORIEN[selectedKategorie]}" für "${bild.title}" löschen? Bild und Beschreibung werden entfernt.`}
            onConfirm={handleClear}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLibrary && (
          <LibraryPickerModal onSelect={handleLibrarySelect} onClose={() => setShowLibrary(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

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
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 className="font-oswald text-xl font-bold text-white">Fehleranalyse: {phaseTitle}</h2>
          <div className="flex items-center gap-2">
            <button onClick={onSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors" data-testid="save-analysis-btn">
              <Save className="w-4 h-4" /> Speichern
            </button>
            <button onClick={onClose} className="p-2 hover:bg-zinc-700 rounded-lg transition-colors">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>
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
  const [analyzingPhase, setAnalyzingPhase] = useState(null);
  const [analyzingFrame, setAnalyzingFrame] = useState(null);

  useEffect(() => {
    document.title = "Fehlerbilder | SportWissen";
  }, []);

  const bilder = [
    { id: 1, section: "bild1", title: "1. Angleiten" },
    { id: 2, section: "bild2", title: "2. Stoßauslage" },
    { id: 3, section: "bild3", title: "3. Dreh-Streck-Bewegung" },
    { id: 4, section: "bild4", title: "4. Abstoß" },
  ];

  const handleFrameCaptured = (frame) => {
    setCapturedFrames(prev => [...prev, frame]);
  };

  const handleDeleteFrame = (frameId) => {
    setCapturedFrames(prev => prev.filter(f => f.id !== frameId));
  };

  const handleAnalyze = (phaseId, frame) => {
    setAnalyzingPhase(phaseId);
    setAnalyzingFrame(frame);
  };

  const handleSaveAnalysis = async () => {
    toast.success("Analyse gespeichert!");
    setAnalyzingPhase(null);
    setAnalyzingFrame(null);
  };

  const analyzingBild = bilder.find(b => b.id === analyzingPhase);

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
          Laden Sie Bilder hoch oder nehmen Sie Videos auf, um Bewegungsfehler zu analysieren
        </p>
      </motion.div>

      {/* Phase Windows Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        data-testid="phase-windows-grid"
      >
        {bilder.map((bild) => (
          <PhaseWindow key={bild.id} bild={bild} onAnalyze={handleAnalyze} />
        ))}
      </motion.div>

      {/* Video Recorder Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={() => setShowVideoRecorder(true)}
          className="w-full flex items-center justify-between bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 hover:bg-blue-500/20 transition-colors mb-4"
          data-testid="video-recorder-btn"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-oswald text-base font-semibold text-white">Video-Aufnahme & Standbild-Extraktion</h3>
              <p className="text-xs text-zinc-400">Bewegungsabläufe aufnehmen und analysieren</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {capturedFrames.length > 0 && (
              <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">{capturedFrames.length} Bilder</span>
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
            <div className="flex-shrink-0 bg-zinc-900 border-b border-zinc-700 px-3 py-2">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-oswald text-base font-bold text-white">Video-Aufnahme</h2>
                <button
                  onClick={() => { setShowVideoRecorder(false); setCapturedFrames([]); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors"
                  data-testid="close-video-recorder"
                >
                  <X className="w-4 h-4" /> Schließen
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {bilder.map((bild) => (
                  <div key={bild.id} className="py-1 px-1 rounded text-center text-[10px] font-medium border border-zinc-600 bg-zinc-800 text-zinc-500">
                    {bild.title.replace(/^\d+\.\s*/, '')}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <VideoRecorder
                onFrameCaptured={handleFrameCaptured}
                savedFrames={capturedFrames}
                onDeleteFrame={handleDeleteFrame}
                onAssignFrame={() => {}}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Modal */}
      <AnimatePresence>
        {analyzingPhase && analyzingFrame && analyzingBild && (
          <AnalysisModal
            frame={analyzingFrame}
            phaseTitle={analyzingBild.title}
            onClose={() => { setAnalyzingPhase(null); setAnalyzingFrame(null); }}
            onSave={handleSaveAnalysis}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
