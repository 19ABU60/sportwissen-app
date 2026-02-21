import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaUpload } from "@/components/MediaUpload";

export default function OBrien() {
  useEffect(() => {
    document.title = "O'Brien-Technik | SportWissen";
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <h1 className="font-oswald text-3xl md:text-4xl font-bold tracking-tight text-white">
            O'Brien-Technik
          </h1>
          <Award className="w-8 h-8 text-yellow-500" />
        </div>
        <p className="text-zinc-400 mt-2">
          Die Zieltechnik im Kugelstoßen
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video 1 - Gesamtbewegung */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden"
        >
          <MediaUpload
            page="obrien"
            section="gesamtbewegung"
            mediaType="video"
            aspectRatio="aspect-video"
            placeholderText="Video einfügen"
          />
          <div className="p-4">
            <h3 className="font-oswald text-lg font-semibold text-white">
              Gesamtbewegung
            </h3>
          </div>
        </motion.div>

        {/* Video 2 - Steuerung von Übungsabläufen */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden"
        >
          <MediaUpload
            page="obrien"
            section="uebungsablaeufe"
            mediaType="video"
            aspectRatio="aspect-video"
            placeholderText="Video einfügen"
          />
          <div className="p-4">
            <h3 className="font-oswald text-lg font-semibold text-white">
              Steuerung von Übungsabläufen
            </h3>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-between items-center mt-8"
      >
        <Link to="/videos">
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Zurück: 4. Stoß
          </Button>
        </Link>
        <Link to="/">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Zur Übersicht
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
