import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trash2, Video, Image as ImageIcon, 
  Download, ChevronDown, ChevronUp, Folder, X, Copy, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lightbox } from "@/components/Lightbox";
import { toast } from "sonner";

// Target destinations for copying media
const COPY_DESTINATIONS = [
  { page: "phasen", section: "phase1", label: "Phasenstruktur - Phase 1", type: "image" },
  { page: "phasen", section: "phase2", label: "Phasenstruktur - Phase 2", type: "image" },
  { page: "phasen", section: "phase3", label: "Phasenstruktur - Phase 3", type: "image" },
  { page: "phasen", section: "phase4", label: "Phasenstruktur - Phase 4", type: "image" },
  { page: "ausgangsstellung", section: "hauptbild", label: "Ausgangsstellung - Hauptbild", type: "image" },
  { page: "angleiten", section: "nachstellschritt", label: "Angleiten - Video Nachstellschritt", type: "video" },
  { page: "angleiten", section: "obrien-angleiten", label: "Angleiten - Video O'Brien", type: "video" },
  { page: "stossauslage", section: "hauptbild", label: "Stoßauslage - Hauptbild", type: "image" },
  { page: "videos", section: "stossphase", label: "4. Stoß - Video Stoßphase", type: "video" },
  { page: "videos", section: "zeitlupe", label: "4. Stoß - Video Zeitlupe", type: "video" },
  { page: "obrien", section: "technik1", label: "O'Brien - Bild 1", type: "image" },
  { page: "obrien", section: "technik2", label: "O'Brien - Bild 2", type: "image" },
];

export default function MediaLibrary() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, video, image
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [copyModal, setCopyModal] = useState(null); // Media item to copy

  useEffect(() => {
    document.title = "Medienverwaltung | SportWissen";
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/media/list/all`);
      if (response.ok) {
        const data = await response.json();
        setMedia(data.media || []);
      }
    } catch (err) {
      console.error("Error fetching media:", err);
      toast.error("Fehler beim Laden der Medien");
    } finally {
      setLoading(false);
    }
  };

  const copyMediaTo = async (mediaItem, destination) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/media/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_id: mediaItem.id,
          target_page: destination.page,
          target_section: destination.section
        })
      });
      
      if (response.ok) {
        toast.success(`Medium kopiert nach "${destination.label}"`);
        setCopyModal(null);
        fetchMedia(); // Refresh list
      } else {
        throw new Error("Copy failed");
      }
    } catch (err) {
      console.error("Copy error:", err);
      toast.error("Fehler beim Kopieren");
    }
  };

  const deleteMedia = async (mediaId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/media/${mediaId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setMedia(prev => prev.filter(m => m.id !== mediaId));
        toast.success("Medium gelöscht");
        setDeleteConfirm(null);
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      console.error("Error deleting media:", err);
      toast.error("Fehler beim Löschen");
    }
  };

  // Group media by page
  const groupedMedia = media.reduce((acc, item) => {
    const page = item.page || "Sonstige";
    if (!acc[page]) acc[page] = [];
    acc[page].push(item);
    return acc;
  }, {});

  const filteredGroupedMedia = Object.entries(groupedMedia).reduce((acc, [page, items]) => {
    const filtered = items.filter(item => {
      if (filter === "all") return true;
      if (filter === "video") return item.media_type === "video";
      if (filter === "image") return item.media_type === "image";
      return true;
    });
    if (filtered.length > 0) acc[page] = filtered;
    return acc;
  }, {});

  const toggleSection = (page) => {
    setExpandedSections(prev => ({
      ...prev,
      [page]: !prev[page]
    }));
  };

  const pageNames = {
    "fehleranalyse": "Fehlerbilder",
    "angleiten": "Angleiten",
    "ausgangsstellung": "Ausgangsstellung",
    "technique": "Stoßauslage",
    "stossauslage": "Stoßauslage",
    "videos": "Stoß",
    "obrien": "O'Brien-Technik",
    "phasen": "Phasenstruktur"
  };

  const totalVideos = media.filter(m => m.media_type === "video").length;
  const totalImages = media.filter(m => m.media_type === "image").length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-oswald text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
          Medienverwaltung
        </h1>
        <p className="text-zinc-400 text-sm">
          Hier können Sie alle hochgeladenen Videos und Bilder verwalten
        </p>
      </motion.div>

      {/* Stats & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-4 mb-6"
      >
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-zinc-400">
            <Video className="w-4 h-4" />
            {totalVideos} Videos
          </span>
          <span className="flex items-center gap-1 text-zinc-400">
            <ImageIcon className="w-4 h-4" />
            {totalImages} Bilder
          </span>
        </div>
        
        <div className="flex gap-2 ml-auto">
          {["all", "video", "image"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {f === "all" ? "Alle" : f === "video" ? "Videos" : "Bilder"}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Medien werden geladen...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && media.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-zinc-800/50 rounded-xl border border-zinc-700"
        >
          <Folder className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 mb-2">Keine Medien vorhanden</p>
          <p className="text-zinc-500 text-sm">
            Laden Sie Bilder oder Videos in den verschiedenen Menüs hoch
          </p>
        </motion.div>
      )}

      {/* Media Groups */}
      {!loading && Object.keys(filteredGroupedMedia).length > 0 && (
        <div className="space-y-4">
          {Object.entries(filteredGroupedMedia).map(([page, items]) => (
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(page)}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Folder className="w-5 h-5 text-blue-400" />
                  <span className="font-oswald font-semibold text-white">
                    {pageNames[page] || page}
                  </span>
                  <span className="text-xs text-zinc-500">
                    ({items.length} {items.length === 1 ? "Datei" : "Dateien"})
                  </span>
                </div>
                {expandedSections[page] ? (
                  <ChevronUp className="w-5 h-5 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-400" />
                )}
              </button>

              {/* Section Content */}
              <AnimatePresence>
                {expandedSections[page] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-zinc-700"
                  >
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="relative group bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700"
                        >
                          {/* Thumbnail */}
                          <div 
                            className="aspect-video cursor-pointer"
                            onClick={() => {
                              if (item.media_type === "image") {
                                setSelectedMedia(item);
                                setShowLightbox(true);
                              }
                            }}
                          >
                            {item.media_type === "video" ? (
                              <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                <Video className="w-8 h-8 text-zinc-500" />
                              </div>
                            ) : (
                              <img
                                src={`${process.env.REACT_APP_BACKEND_URL}${item.url}`}
                                alt={item.filename}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>

                          {/* Info & Actions */}
                          <div className="p-2">
                            <p className="text-[10px] text-zinc-400 truncate mb-2">
                              {item.section || item.filename}
                            </p>
                            <div className="flex gap-1">
                              {item.media_type === "video" && (
                                <a
                                  href={`${process.env.REACT_APP_BACKEND_URL}${item.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] py-1 rounded text-center"
                                >
                                  Abspielen
                                </a>
                              )}
                              <button
                                onClick={() => setCopyModal(item)}
                                className="p-1 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white rounded transition-colors"
                                title="Kopieren nach..."
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(item)}
                                className="p-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded transition-colors"
                                title="Löschen"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && selectedMedia && (
        <Lightbox
          src={`${process.env.REACT_APP_BACKEND_URL}${selectedMedia.url}`}
          alt={selectedMedia.filename}
          onClose={() => {
            setShowLightbox(false);
            setSelectedMedia(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 rounded-xl p-6 max-w-sm w-full border border-zinc-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-oswald text-lg font-bold text-white mb-2">
                Medium löschen?
              </h3>
              <p className="text-zinc-400 text-sm mb-4">
                Sind Sie sicher, dass Sie "{deleteConfirm.filename}" löschen möchten? 
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setDeleteConfirm(null)}
                  variant="outline"
                  className="flex-1 border-zinc-600"
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={() => deleteMedia(deleteConfirm.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Löschen
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copy Modal */}
      <AnimatePresence>
        {copyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setCopyModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 rounded-xl p-4 max-w-md w-full border border-zinc-700 max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-oswald text-lg font-bold text-white">
                  Kopieren nach...
                </h3>
                <button
                  onClick={() => setCopyModal(null)}
                  className="p-1 hover:bg-zinc-700 rounded"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
              
              <p className="text-zinc-400 text-sm mb-4">
                <span className="text-white font-medium">{copyModal.filename}</span>
                <br />
                <span className="text-xs">Typ: {copyModal.media_type === "video" ? "Video" : "Bild"}</span>
              </p>
              
              <div className="text-xs text-zinc-500 mb-2">Ziel auswählen:</div>
              
              <div className="overflow-y-auto flex-1 space-y-1">
                {COPY_DESTINATIONS
                  .filter(dest => dest.type === copyModal.media_type || dest.type === "both")
                  .map((dest, index) => (
                    <button
                      key={index}
                      onClick={() => copyMediaTo(copyModal, dest)}
                      className="w-full flex items-center justify-between p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-left"
                    >
                      <span className="text-sm text-zinc-200">{dest.label}</span>
                      <ArrowRight className="w-4 h-4 text-zinc-500" />
                    </button>
                  ))
                }
              </div>
              
              <div className="mt-4 pt-4 border-t border-zinc-700">
                <Button
                  onClick={() => setCopyModal(null)}
                  variant="outline"
                  className="w-full border-zinc-600"
                >
                  Abbrechen
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
