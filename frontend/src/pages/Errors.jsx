import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { MediaUpload } from "@/components/MediaUpload";

export default function Errors() {
  useEffect(() => {
    document.title = "Fehlerbilder | SportWissen";
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
          <Link to="/" className="hover:text-zinc-300">Übersicht</Link>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="font-oswald text-3xl md:text-4xl font-bold tracking-tight text-white">
            Fehlerbilder
          </h1>
          <AlertTriangle className="w-7 h-7 text-amber-500" />
        </div>
        <p className="text-zinc-400 mt-2">
          Typische Fehler erkennen und korrigieren
        </p>
      </motion.div>

      {/* 4 Bilder Grid - 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bild 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden"
        >
          <MediaUpload
            page="fehlerbilder"
            section="bild1"
            mediaType="image"
            aspectRatio="aspect-[4/3]"
            placeholderText="Fehlerbild 1 einfügen"
          />
          <div className="p-3">
            <h3 className="font-oswald text-base font-semibold text-white">
              Fehler beim Angleiten
            </h3>
          </div>
        </motion.div>

        {/* Bild 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden"
        >
          <MediaUpload
            page="fehlerbilder"
            section="bild2"
            mediaType="image"
            aspectRatio="aspect-[4/3]"
            placeholderText="Fehlerbild 2 einfügen"
          />
          <div className="p-3">
            <h3 className="font-oswald text-base font-semibold text-white">
              Fehler in der Stoßauslage
            </h3>
          </div>
        </motion.div>

        {/* Bild 3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden"
        >
          <MediaUpload
            page="fehlerbilder"
            section="bild3"
            mediaType="image"
            aspectRatio="aspect-[4/3]"
            placeholderText="Fehlerbild 3 einfügen"
          />
          <div className="p-3">
            <h3 className="font-oswald text-base font-semibold text-white">
              Fehler beim Stoß
            </h3>
          </div>
        </motion.div>

        {/* Bild 4 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden"
        >
          <MediaUpload
            page="fehlerbilder"
            section="bild4"
            mediaType="image"
            aspectRatio="aspect-[4/3]"
            placeholderText="Fehlerbild 4 einfügen"
          />
          <div className="p-3">
            <h3 className="font-oswald text-base font-semibold text-white">
              Fehler beim Abstoß
            </h3>
          </div>
        </motion.div>
      </div>

      {/* Zurück Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Link to="/">
          <button className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors">
            Zur Übersicht
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
