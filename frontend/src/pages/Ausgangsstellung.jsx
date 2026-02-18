import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Merkmale für Nachstellschritt seitwärts
const MERKMALE_NACHSTELLSCHRITT = [
  "Ausrichtung seitlich zur Stoßrichtung",
  "Kugel liegt auf den Fingerwurzeln",
  "Kugel am Hals (unter dem Kinn)",
  "Ellbogen etwa auf Schulterhöhe",
  "Blick geradeaus",
  "Körpergewicht auf dem leicht gebeugten Druckbein",
  "Stemmbein nur leicht aufgesetzt"
];

// Merkmale für O'Brien-Technik
const MERKMALE_OBRIEN = [
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
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

      {/* Zwei Spalten: Nachstellschritt seitwärts und O'Brien-Technik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Linke Spalte: Nachstellschritt seitwärts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4"
        >
          <h2 className="font-oswald text-lg font-semibold uppercase tracking-wide text-white mb-4">
            Nachstellschritt seitwärts
          </h2>
          
          {/* Merkmale */}
          <ul className="space-y-2 mb-4">
            {MERKMALE_NACHSTELLSCHRITT.map((merkmal, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-2"
              >
                <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-medium">{index + 1}</span>
                </div>
                <span className="text-zinc-300 text-sm">{merkmal}</span>
              </motion.li>
            ))}
          </ul>

          {/* Bild-Platzhalter - kleiner */}
          <div className="aspect-[16/9] bg-zinc-700/50 rounded-lg overflow-hidden border border-zinc-600 mt-2">
            <img
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&q=80"
              alt="Nachstellschritt seitwärts"
              className="w-full h-full object-cover opacity-60"
            />
          </div>
          <p className="text-xs text-zinc-500 text-center mt-1">Platzhalter</p>
        </motion.div>

        {/* Rechte Spalte: O'Brien-Technik */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4"
        >
          <h2 className="font-oswald text-lg font-semibold uppercase tracking-wide text-white mb-4">
            O'Brien-Technik
          </h2>
          
          {/* Merkmale */}
          <ul className="space-y-2 mb-4">
            {MERKMALE_OBRIEN.map((merkmal, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-2"
              >
                <div className="w-5 h-5 rounded bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-400 text-xs font-medium">{index + 1}</span>
                </div>
                <span className="text-zinc-300 text-sm">{merkmal}</span>
              </motion.li>
            ))}
          </ul>

          {/* Bild-Platzhalter - kleiner */}
          <div className="aspect-[16/9] bg-zinc-700/50 rounded-lg overflow-hidden border border-zinc-600 mt-2">
            <img
              src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300&q=80"
              alt="O'Brien-Technik"
              className="w-full h-full object-cover opacity-60"
            />
          </div>
          <p className="text-xs text-zinc-500 text-center mt-1">Platzhalter</p>
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
