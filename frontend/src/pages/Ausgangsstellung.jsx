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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header - kompakter */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-1">
          <Link to="/" className="hover:text-zinc-300">Übersicht</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-zinc-300">Phase 1</span>
        </div>
        <h1 className="font-oswald text-2xl md:text-3xl font-bold tracking-tight uppercase text-white">
          1. Ausgangsstellung
        </h1>
      </motion.div>

      {/* Zwei Spalten: Nachstellschritt seitwärts und O'Brien-Technik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Linke Spalte: Nachstellschritt seitwärts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3"
        >
          <h2 className="font-oswald text-sm font-semibold uppercase tracking-wide text-white mb-2">
            Nachstellschritt seitwärts
          </h2>
          
          <div className="flex gap-3">
            {/* Merkmale links */}
            <ul className="space-y-1 flex-1">
              {MERKMALE_NACHSTELLSCHRITT.map((merkmal, index) => (
                <li key={index} className="flex items-start gap-1.5">
                  <div className="w-4 h-4 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-[10px] font-medium">{index + 1}</span>
                  </div>
                  <span className="text-zinc-300 text-xs leading-tight">{merkmal}</span>
                </li>
              ))}
            </ul>

            {/* Bild-Platzhalter rechts - Hochformat */}
            <div className="w-24 flex-shrink-0">
              <div className="aspect-[3/4] bg-zinc-700/50 rounded-lg border border-zinc-600 flex items-center justify-center">
                <span className="text-[10px] text-zinc-500 text-center px-1">Bild<br/>Platzhalter</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rechte Spalte: O'Brien-Technik */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3"
        >
          <h2 className="font-oswald text-sm font-semibold uppercase tracking-wide text-white mb-2">
            O'Brien-Technik
          </h2>
          
          <div className="flex gap-3">
            {/* Merkmale links */}
            <ul className="space-y-1 flex-1">
              {MERKMALE_OBRIEN.map((merkmal, index) => (
                <li key={index} className="flex items-start gap-1.5">
                  <div className="w-4 h-4 rounded bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-400 text-[10px] font-medium">{index + 1}</span>
                  </div>
                  <span className="text-zinc-300 text-xs leading-tight">{merkmal}</span>
                </li>
              ))}
            </ul>

            {/* Bild-Platzhalter rechts - Hochformat */}
            <div className="w-24 flex-shrink-0">
              <div className="aspect-[3/4] bg-zinc-700/50 rounded-lg border border-zinc-600 flex items-center justify-center">
                <span className="text-[10px] text-zinc-500 text-center px-1">Bild<br/>Platzhalter</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hinweise zum Lehrerstandpunkt - Rollmenü */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-4"
      >
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl">
          {/* Rollmenü Header */}
          <button
            onClick={() => setShowLehrerHinweise(!showLehrerHinweise)}
            className="w-full flex items-center justify-between p-3 hover:bg-zinc-700/30 transition-colors rounded-xl"
            data-testid="toggle-lehrer-hinweise"
          >
            <h2 className="font-oswald text-sm font-semibold uppercase tracking-wide text-zinc-200">
              Hinweise zum Lehrerstandpunkt
            </h2>
            {showLehrerHinweise ? (
              <ChevronUp className="w-5 h-5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-400" />
            )}
          </button>

          {/* Collapsible Hinweise - nach oben aufklappen */}
          <AnimatePresence>
            {showLehrerHinweise && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3">
                  <div className="grid grid-cols-1 gap-2">
                    {LEHRER_HINWEISE.map((hinweis, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-2 p-2 bg-zinc-700/30 rounded-lg"
                      >
                        <div className="w-5 h-5 rounded bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-green-400 text-[10px] font-medium">{index + 1}</span>
                        </div>
                        <p className="text-zinc-300 text-xs leading-relaxed">{hinweis}</p>
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
        transition={{ delay: 0.4 }}
        className="flex justify-between items-center"
      >
        <Link to="/phasen">
          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Phasenübersicht
          </Button>
        </Link>
        <Link to="/angleiten">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            Weiter: 2. Angleiten
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
