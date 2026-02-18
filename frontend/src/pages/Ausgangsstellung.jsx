import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
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

// Hinweise zum Lehrerstandpunkt
const LEHRER_HINWEISE = [
  "Hinweis 1 - hier können Sie Ihre Anmerkungen zum Lehrerstandpunkt einfügen",
  "Hinweis 2 - hier können Sie Ihre Anmerkungen zum Lehrerstandpunkt einfügen",
  "Hinweis 3 - hier können Sie Ihre Anmerkungen zum Lehrerstandpunkt einfügen",
  "Hinweis 4 - hier können Sie Ihre Anmerkungen zum Lehrerstandpunkt einfügen",
  "Hinweis 5 - hier können Sie Ihre Anmerkungen zum Lehrerstandpunkt einfügen"
];

export default function Ausgangsstellung() {
  const [showLehrerHinweise, setShowLehrerHinweise] = useState(false);

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Linke Spalte: Nachstellschritt seitwärts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4"
        >
          <h2 className="font-oswald text-base font-semibold uppercase tracking-wide text-white mb-3">
            Nachstellschritt seitwärts
          </h2>
          
          {/* Merkmale */}
          <ul className="space-y-1.5 mb-3">
            {MERKMALE_NACHSTELLSCHRITT.map((merkmal, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-medium">{index + 1}</span>
                </div>
                <span className="text-zinc-300 text-sm">{merkmal}</span>
              </li>
            ))}
          </ul>

          {/* Bild-Platzhalter - noch kleiner */}
          <div className="h-20 bg-zinc-700/50 rounded-lg overflow-hidden border border-zinc-600 flex items-center justify-center">
            <span className="text-xs text-zinc-500">Bild-Platzhalter</span>
          </div>
        </motion.div>

        {/* Rechte Spalte: O'Brien-Technik */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4"
        >
          <h2 className="font-oswald text-base font-semibold uppercase tracking-wide text-white mb-3">
            O'Brien-Technik
          </h2>
          
          {/* Merkmale */}
          <ul className="space-y-1.5 mb-3">
            {MERKMALE_OBRIEN.map((merkmal, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-400 text-xs font-medium">{index + 1}</span>
                </div>
                <span className="text-zinc-300 text-sm">{merkmal}</span>
              </li>
            ))}
          </ul>

          {/* Bild-Platzhalter - noch kleiner */}
          <div className="h-20 bg-zinc-700/50 rounded-lg overflow-hidden border border-zinc-600 flex items-center justify-center">
            <span className="text-xs text-zinc-500">Bild-Platzhalter</span>
          </div>
        </motion.div>
      </div>

      {/* Hinweise zum Lehrerstandpunkt - Rollmenü */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl">
          {/* Rollmenü Header */}
          <button
            onClick={() => setShowLehrerHinweise(!showLehrerHinweise)}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-700/30 transition-colors rounded-xl"
            data-testid="toggle-lehrer-hinweise"
          >
            <h2 className="font-oswald text-base font-semibold uppercase tracking-wide text-zinc-200">
              Hinweise zum Lehrerstandpunkt
            </h2>
            {showLehrerHinweise ? (
              <ChevronUp className="w-5 h-5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-400" />
            )}
          </button>

          {/* Collapsible Hinweise */}
          <AnimatePresence>
            {showLehrerHinweise && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <div className="space-y-2">
                    {LEHRER_HINWEISE.map((hinweis, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 p-3 bg-zinc-700/30 rounded-lg"
                      >
                        <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-green-400 text-xs font-medium">{index + 1}</span>
                        </div>
                        <p className="text-zinc-300 text-sm leading-relaxed">{hinweis}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex justify-between items-center"
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
