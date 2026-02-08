import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const MERKMALE = [
  "Rücken zur Stoßrichtung",
  "Kugel liegt auf den Fingerwurzeln",
  "Kugel am Hals (unter dem Kinn)",
  "Ellbogen etwa auf Schulterhöhe",
  "Blick nach hinten gerichtet",
  "Körpergewicht auf dem Druckbein",
  "Standbein leicht gebeugt"
];

export default function Ausgangsstellung() {
  useEffect(() => {
    document.title = "Ausgangsstellung | SportWissen";
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
          <Link to="/" className="hover:text-zinc-300">Übersicht</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-zinc-300">Phase 1</span>
        </div>
        <h1 className="font-oswald text-3xl md:text-4xl font-bold tracking-tight uppercase text-white mb-2">
          1. Ausgangsstellung
        </h1>
        <p className="text-zinc-400">
          Die Startposition für den Kugelstoß - Grundlage für alle weiteren Bewegungsphasen
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bild/Video Bereich */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="aspect-[4/3] relative">
              <img
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80"
                alt="Ausgangsstellung Demonstration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-medium">Ausgangsstellung</p>
                <p className="text-zinc-300 text-sm">Rücken zur Stoßrichtung</p>
              </div>
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-zinc-800">
              <p className="text-sm text-zinc-500">
                Platzhalter - Hier kommt später das echte Demonstrationsvideo
              </p>
            </div>
          </div>
        </motion.div>

        {/* Merkmale */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h2 className="font-oswald text-lg font-semibold uppercase tracking-wide text-white mb-4">
              Wesentliche Merkmale
            </h2>
            <ul className="space-y-3">
              {MERKMALE.map((merkmal, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-sm font-medium">{index + 1}</span>
                  </div>
                  <span className="text-zinc-300">{merkmal}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Hinweis-Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-300 mb-1">Didaktischer Hinweis</h3>
                <p className="text-sm text-zinc-400">
                  Die korrekte Ausgangsstellung ist fundamental für den gesamten Bewegungsablauf. 
                  Fehler hier setzen sich in allen folgenden Phasen fort.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex justify-between items-center"
      >
        <Link to="/phasen">
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Phasenübersicht
          </Button>
        </Link>
        <Link to="/angleiten">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Weiter: 2. Angleiten
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
