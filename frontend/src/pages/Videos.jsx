import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaUpload } from "@/components/MediaUpload";

export default function Videos() {
  useEffect(() => {
    document.title = "Stoß | SportWissen";
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
          <Link to="/" className="hover:text-zinc-300">Übersicht</Link>
        </div>
        <h1 className="font-oswald text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
          4. Stoß
        </h1>
        <p className="text-zinc-400">
          Die Hauptbeschleunigungsphase und der Abstoß
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden"
        >
          <MediaUpload
            page="stoss"
            section="video1"
            mediaType="video"
            aspectRatio="aspect-video"
            placeholderText="Video: Stoßphase einfügen"
          />
          <div className="p-4">
            <h3 className="font-oswald text-lg font-semibold text-white mb-1">
              Der Stoß
            </h3>
            <p className="text-sm text-zinc-400">
              Beschleunigung und Abstoß der Kugel
            </p>
          </div>
        </motion.div>

        {/* Video 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden"
        >
          <MediaUpload
            page="stoss"
            section="video2"
            mediaType="video"
            aspectRatio="aspect-video"
            placeholderText="Video: Zeitlupe einfügen"
          />
          <div className="p-4">
            <h3 className="font-oswald text-lg font-semibold text-white mb-1">
              Zeitlupenanalyse
            </h3>
            <p className="text-sm text-zinc-400">
              Die Stoßphase in Zeitlupe
            </p>
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
        <Link to="/technik">
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Zurück: 3. Stoßauslage
          </Button>
        </Link>
        <Link to="/obrien">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Weiter: O'Brien-Technik
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
