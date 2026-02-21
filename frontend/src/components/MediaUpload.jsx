import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image, Video, Trash2, ZoomIn, Loader2 } from "lucide-react";
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

    if (!confirm("Möchten Sie dieses Medium wirklich löschen?")) return;

    try {
      const response = await fetch(`${API_URL}/api/media/${media.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMedia(null);
        onMediaChange?.(null);
        toast.success("Medium erfolgreich gelöscht");
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
            {media.media_type === "image" ? (
              <img 
                src={mediaUrl} 
                alt={media.original_name}
                className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => setShowLightbox(true)}
              />
            ) : (
              <video 
                src={mediaUrl}
                className="w-full h-full object-cover"
                controls
                data-testid={`video-${page}-${section}`}
              />
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
                  onClick={handleDelete}
                  className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full backdrop-blur-sm"
                  title="Löschen"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          // Empty - Upload placeholder
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center hover:bg-zinc-600/30 transition-colors cursor-pointer"
            data-testid={`upload-btn-${page}-${section}`}
          >
            <div className="p-3 rounded-full bg-zinc-600/50 mb-2">
              {mediaType === "video" ? (
                <Video className="w-6 h-6 text-zinc-400" />
              ) : mediaType === "image" ? (
                <Image className="w-6 h-6 text-zinc-400" />
              ) : (
                <Upload className="w-6 h-6 text-zinc-400" />
              )}
            </div>
            <span className="text-[10px] text-zinc-500 text-center px-2">{placeholderText}</span>
            <span className="text-[9px] text-zinc-600 mt-1">Klicken zum Hochladen</span>
          </button>
        )}
      </div>

      {/* Lightbox */}
      {media?.media_type === "image" && (
        <Lightbox 
          isOpen={showLightbox} 
          onClose={() => setShowLightbox(false)} 
          src={mediaUrl}
          alt={media?.original_name}
        />
      )}
    </div>
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
