import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image, Video, Trash2, ZoomIn, Loader2, FolderOpen, ChevronRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lightbox } from "./Lightbox";

const API_URL = process.env.REACT_APP_BACKEND_URL || "";

export function MediaUpload({ 
  page, 
  section, 
  mediaType = "image", // "image" | "video" | "both"
  aspectRatio = "aspect-[3/4]", // For image preview
  placeholderText = "Bild/Video hier einfügen",
  className = "",
  onMediaChange
}) {
  const [media, setMedia] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryMedia, setLibraryMedia] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch existing media on mount
  useEffect(() => {
    fetchMedia();
  }, [page, section]);

  const fetchMedia = async () => {
    try {
      const response = await fetch(`${API_URL}/api/media/${page}/${section}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setMedia(data);
          onMediaChange?.(data);
        }
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    
    if (mediaType === "image" && !isImage) {
      toast.error("Bitte nur Bilddateien (JPG, PNG, WebP) hochladen");
      return;
    }
    if (mediaType === "video" && !isVideo) {
      toast.error("Bitte nur Videodateien (MP4, WebM) hochladen");
      return;
    }
    if (mediaType === "both" && !isImage && !isVideo) {
      toast.error("Bitte nur Bild- oder Videodateien hochladen");
      return;
    }

    // Upload file
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("page", page);
    formData.append("section", section);
    formData.append("is_default", "false");

    try {
      const response = await fetch(`${API_URL}/api/media/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Upload fehlgeschlagen");
      }

      const result = await response.json();
      
      if (result.success) {
        setMedia(result.media);
        onMediaChange?.(result.media);
        toast.success(result.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload fehlgeschlagen");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!media?.id) return;

    try {
      const response = await fetch(`${API_URL}/api/media/${media.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMedia(null);
        onMediaChange?.(null);
        setShowDeleteConfirm(false);
        toast.success("Medium erfolgreich gelöscht");
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Löschen fehlgeschlagen");
    }
  };

  const getAcceptTypes = () => {
    if (mediaType === "image") return "image/jpeg,image/png,image/webp,image/gif";
    if (mediaType === "video") return "video/mp4,video/webm,video/quicktime";
    return "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm";
  };

  // Fetch library media
  const openLibrary = async () => {
    setShowLibrary(true);
    setLoadingLibrary(true);
    try {
      const response = await fetch(`${API_URL}/api/media/list/all`);
      if (response.ok) {
        const data = await response.json();
        // Filter by media type
        const filtered = (data.media || []).filter(m => {
          if (mediaType === "image") return m.media_type === "image";
          if (mediaType === "video") return m.media_type === "video";
          return true;
        });
        setLibraryMedia(filtered);
      }
    } catch (error) {
      console.error("Error fetching library:", error);
      toast.error("Fehler beim Laden der Medienbibliothek");
    } finally {
      setLoadingLibrary(false);
    }
  };

  // Select media from library
  const selectFromLibrary = async (item) => {
    setIsUploading(true);
    setShowLibrary(false);
    
    try {
      const response = await fetch(`${API_URL}/api/media/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_id: item.id,
          target_page: page,
          target_section: section
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMedia(data.media);
        onMediaChange?.(data.media);
        toast.success("Medium eingefügt!");
      } else {
        throw new Error("Copy failed");
      }
    } catch (error) {
      console.error("Select from library error:", error);
      toast.error("Fehler beim Einfügen");
    } finally {
      setIsUploading(false);
    }
  };

  const mediaUrl = media?.url ? `${API_URL}${media.url}` : null;

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptTypes()}
        onChange={handleFileSelect}
        className="hidden"
        data-testid={`media-input-${page}-${section}`}
      />

      {/* Media Display or Upload Area */}
      <div 
        className={`${aspectRatio} bg-zinc-700/50 rounded-lg border border-zinc-600 overflow-hidden relative group`}
      >
        {isUploading ? (
          // Upload Progress
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800/80">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-2" />
            <span className="text-xs text-zinc-400">Wird hochgeladen...</span>
          </div>
        ) : media && mediaUrl ? (
          // Show Media
          <>
            {media.media_type === "image" && (
              <img 
                src={mediaUrl} 
                alt={media.original_name}
                className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => setShowLightbox(true)}
              />
            )}
            {media.media_type === "video" && media.thumbnail_url && (
              <div className="relative w-full h-full cursor-pointer" onClick={() => setShowLightbox(true)}>
                <img 
                  src={`${API_URL}${media.thumbnail_url}`}
                  alt={media.original_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[14px] border-transparent border-l-white ml-1" />
                  </div>
                </div>
              </div>
            )}
            {media.media_type === "video" && !media.thumbnail_url && (
              <div className="relative w-full h-full">
                <video 
                  src={mediaUrl}
                  className="w-full h-full object-cover"
                  controls
                  data-testid={`video-${page}-${section}`}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); setShowLightbox(true); }}
                  className="absolute top-2 left-2 flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors z-10"
                  data-testid={`capture-btn-${page}-${section}`}
                >
                  <Camera className="w-3.5 h-3.5" /> Standbild
                </button>
              </div>
            )}
            
            {/* Overlay actions - positioned in top right corner for videos */}
            <div className={`absolute ${media.media_type === "video" ? "top-2 right-2" : "inset-0"} ${media.media_type === "image" ? "bg-black/0 group-hover:bg-black/40" : ""} transition-colors`}>
              <div className={`${media.media_type === "video" ? "flex gap-2" : "absolute inset-0 flex items-center justify-center gap-2"} opacity-0 group-hover:opacity-100 transition-opacity`}>
                {media.media_type === "image" && (
                  <button
                    onClick={() => setShowLightbox(true)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm"
                    title="Vergrößern"
                  >
                    <ZoomIn className="w-5 h-5 text-white" />
                  </button>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-blue-500/80 hover:bg-blue-500 rounded-full backdrop-blur-sm"
                  title="Ersetzen"
                >
                  <Upload className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full backdrop-blur-sm"
                  title="Löschen"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          // Empty - Upload placeholder with two options
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
            <div className="flex gap-2 mb-2">
              {/* Upload from device */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center p-3 rounded-lg bg-zinc-600/30 hover:bg-zinc-600/50 transition-colors cursor-pointer"
                data-testid={`upload-btn-${page}-${section}`}
              >
                <Upload className="w-5 h-5 text-zinc-400 mb-1" />
                <span className="text-[9px] text-zinc-500">Hochladen</span>
              </button>
              
              {/* Select from library */}
              <button
                onClick={openLibrary}
                className="flex flex-col items-center p-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 transition-colors cursor-pointer border border-blue-500/30"
                data-testid={`library-btn-${page}-${section}`}
              >
                <FolderOpen className="w-5 h-5 text-blue-400 mb-1" />
                <span className="text-[9px] text-blue-400">Bibliothek</span>
              </button>
            </div>
            <span className="text-[9px] text-zinc-600 text-center">{placeholderText}</span>
          </div>
        )}
      </div>

      {/* Lightbox for images */}
      {media?.media_type === "image" && (
        <Lightbox 
          isOpen={showLightbox} 
          onClose={() => setShowLightbox(false)} 
          src={mediaUrl}
          alt={media?.original_name}
        />
      )}

      {/* Video Player Modal with Frame Capture */}
      <AnimatePresence>
        {showLightbox && media?.media_type === "video" && mediaUrl && (
          <VideoPlayerModal
            src={mediaUrl}
            page={page}
            onClose={() => setShowLightbox(false)}
          />
        )}
      </AnimatePresence>

      {/* Library Modal */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowLibrary(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 rounded-xl p-4 max-w-lg w-full border border-zinc-700 max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-oswald text-lg font-bold text-white">
                  Aus Bibliothek wählen
                </h3>
                <button
                  onClick={() => setShowLibrary(false)}
                  className="p-1 hover:bg-zinc-700 rounded"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
              
              {loadingLibrary ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
              ) : libraryMedia.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  <FolderOpen className="w-12 h-12 mx-auto mb-2 text-zinc-600" />
                  <p>Keine {mediaType === "video" ? "Videos" : mediaType === "image" ? "Bilder" : "Medien"} in der Bibliothek</p>
                </div>
              ) : (
                <div className="overflow-y-auto flex-1 grid grid-cols-3 gap-2">
                  {libraryMedia.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectFromLibrary(item)}
                      className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all group"
                    >
                      {item.media_type === "video" && item.thumbnail_url && (
                        <div className="relative w-full h-full">
                          <img
                            src={`${API_URL}${item.thumbnail_url}`}
                            alt={item.filename}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                              <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-transparent border-l-white ml-0.5" />
                            </div>
                          </div>
                        </div>
                      )}
                      {item.media_type === "video" && !item.thumbnail_url && (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                          <Video className="w-6 h-6 text-zinc-500" />
                        </div>
                      )}
                      {item.media_type === "image" && (
                        <img
                          src={`${API_URL}${item.url}`}
                          alt={item.filename}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <ChevronRight className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                        <p className="text-[8px] text-white truncate">{item.section || item.page}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-zinc-700">
                <Button
                  onClick={() => setShowLibrary(false)}
                  variant="outline"
                  className="w-full border-zinc-600"
                  size="sm"
                >
                  Abbrechen
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
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
                Möchten Sie dieses Medium wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  className="flex-1 border-zinc-600"
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Löschen
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Video Player Modal with Frame Capture
function VideoPlayerModal({ src, page, onClose }) {
  const videoRef = useRef(null);
  const [capturing, setCapturing] = useState(false);

  const captureFrame = async () => {
    const video = videoRef.current;
    if (!video) return;
    setCapturing(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      const timestamp = video.currentTime;

      const blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", 0.92));
      const formData = new FormData();
      formData.append("file", blob, `standbild_${timestamp.toFixed(1)}s_${Date.now()}.jpg`);
      formData.append("page", page);
      formData.append("section", `standbild_${Date.now()}`);

      const res = await fetch(`${API_URL}/api/media/upload`, { method: "POST", body: formData });
      if (res.ok) {
        toast.success(`Standbild aufgenommen (${timestamp.toFixed(1)}s) und gespeichert`);
      } else {
        toast.error("Fehler beim Speichern");
      }
    } catch {
      toast.error("Standbild konnte nicht erstellt werden");
    }
    setCapturing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="max-w-4xl w-full"
        onClick={e => e.stopPropagation()}
      >
        <video
          ref={videoRef}
          src={src}
          controls
          autoPlay
          className="w-full rounded-lg"
          data-testid="video-player-modal"
        />
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={captureFrame}
            disabled={capturing}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            data-testid="capture-frame-btn"
          >
            <Camera className="w-4 h-4" />
            {capturing ? "Wird gespeichert..." : "Standbild aufnehmen"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm rounded-lg transition-colors"
          >
            Schließen
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Simple image display with lightbox (for read-only views)
export function ImageWithLightbox({ src, alt, className = "", aspectRatio = "aspect-[3/4]" }) {
  const [showLightbox, setShowLightbox] = useState(false);

  if (!src) {
    return (
      <div className={`${aspectRatio} bg-zinc-700/50 rounded-lg border border-zinc-600 flex items-center justify-center ${className}`}>
        <span className="text-[10px] text-zinc-500 text-center px-1">Bild<br/>Platzhalter</span>
      </div>
    );
  }

  return (
    <>
      <div 
        className={`${aspectRatio} rounded-lg overflow-hidden relative group cursor-pointer ${className}`}
        onClick={() => setShowLightbox(true)}
      >
        <img 
          src={src} 
          alt={alt}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <Lightbox isOpen={showLightbox} onClose={() => setShowLightbox(false)} src={src} alt={alt} />
    </>
  );
}
