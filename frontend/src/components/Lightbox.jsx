import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";

export function Lightbox({ isOpen, onClose, src, alt }) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={onClose}
          data-testid="lightbox-overlay"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 transition-colors"
            data-testid="lightbox-close"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Image */}
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            src={src}
            alt={alt || "Vergrößertes Bild"}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            data-testid="lightbox-image"
          />

          {/* Caption */}
          {alt && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-zinc-900/80 px-4 py-2 rounded-lg"
            >
              {alt}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Clickable image that opens lightbox
export function ZoomableImage({ src, alt, className = "", placeholderText = "Bild Platzhalter" }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // If no src, show placeholder
  if (!src) {
    return (
      <div className={`bg-zinc-700/50 rounded-lg border border-zinc-600 flex items-center justify-center ${className}`}>
        <span className="text-[10px] text-zinc-500 text-center px-1">{placeholderText}</span>
      </div>
    );
  }

  return (
    <>
      <div 
        className={`relative group cursor-pointer overflow-hidden rounded-lg ${className}`}
        onClick={() => setIsOpen(true)}
        data-testid="zoomable-image"
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
      <Lightbox isOpen={isOpen} onClose={() => setIsOpen(false)} src={src} alt={alt} />
    </>
  );
}
