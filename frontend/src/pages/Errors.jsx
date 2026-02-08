import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Check, X, Info, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ERROR_IMAGES = [
  {
    id: "e1",
    title: "Fehler beim Angleiten",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80",
    error: "Oberkörper zu früh aufgerichtet",
    description: "Bei der Einführung des rückwärtigen Angleitens erweist sich das flache nach hinten 'Wegstoßen' des Körpers über das Druckbein und das folgenden Eindrehen in die Stoßauslage als ein häufiges zu beobachtendes Problem.",
    correction: "Gängige speziell vorbereitende Übung - geradliniges flaches rückwärtiges Abdrücken mit deutlich hörbarem Geräusch der Schuhsohle durch den Bodenkontakt - sollte unbedingt vorgeschaltet und regelmäßig wiederholt werden.",
  },
  {
    id: "e2",
    title: "Fehler in der Stoßauslage",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=500&q=80",
    error: "Stemmbein zu weit gestreckt",
    description: "Das Stemmbein ist zu weit gestreckt, wodurch die optimale Kraftübertragung nicht möglich ist.",
    correction: "Das Stemmbein sollte leicht gebeugt sein, um eine effektive Kraftübertragung zu ermöglichen.",
  },
  {
    id: "e3",
    title: "Fehler beim Stoß",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80",
    error: "Kugel zu früh losgelassen",
    description: "Die Kugel wird zu früh losgelassen, bevor die volle Streckung erreicht ist.",
    correction: "Die Kugel erst im Moment der vollen Körperstreckung loslassen.",
  },
];

function ErrorCard({ item, isExpanded, onToggle }) {
  return (
    <motion.div
      layout
      className={`
        bg-zinc-900/50 border rounded-xl overflow-hidden
        ${isExpanded ? "border-amber-500/50" : "border-zinc-800 hover:border-zinc-700"}
      `}
    >
      <div
        className="cursor-pointer"
        onClick={onToggle}
        data-testid={`error-card-${item.id}`}
      >
        {/* Image */}
        <div className="relative aspect-video">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Error Badge */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-medium">Kardinalfehler</span>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="font-oswald text-xl font-bold text-white mb-1">
              {item.title}
            </h3>
            <p className="text-red-400 font-medium">{item.error}</p>
          </div>

          {/* Expand Indicator */}
          <div className="absolute bottom-4 right-4">
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 border-t border-zinc-800">
              {/* Description */}
              <div className="mb-6">
                <h4 className="font-oswald text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-2">
                  Beschreibung
                </h4>
                <p className="text-zinc-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Correction */}
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-oswald text-sm font-semibold uppercase tracking-wide text-green-400 mb-1">
                      Korrektur
                    </h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      {item.correction}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Errors() {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="font-oswald text-3xl md:text-4xl font-bold tracking-tight uppercase text-white mb-2">
          Antizipierte Fehlerbilder
        </h1>
        <p className="text-zinc-400">
          Erkenne typische Fehler und lerne, wie du sie korrigieren kannst
        </p>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 md:p-6 mb-8"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-oswald text-lg font-semibold text-blue-300 mb-1">
              Warum Fehlerbilder wichtig sind
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Das Erkennen typischer Fehler ist ein wichtiger Teil des Lernprozesses. 
              Durch das Verstehen von Fehlern kannst du diese bei dir selbst vermeiden 
              und anderen helfen, ihre Technik zu verbessern.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Error Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ERROR_IMAGES.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <ErrorCard
              item={item}
              isExpanded={expandedId === item.id}
              onToggle={() => toggleExpand(item.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* Summary Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
      >
        <h2 className="font-oswald text-xl font-semibold uppercase tracking-wide text-white mb-6">
          Zusammenfassung: Häufige Kardinalfehler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <X className="w-5 h-5 text-red-400" />
              <span className="font-semibold text-red-300">Angleiten</span>
            </div>
            <p className="text-sm text-zinc-400">
              Oberkörper zu früh aufgerichtet
            </p>
          </div>
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <X className="w-5 h-5 text-red-400" />
              <span className="font-semibold text-red-300">Stoßauslage</span>
            </div>
            <p className="text-sm text-zinc-400">
              Stemmbein zu weit gestreckt
            </p>
          </div>
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <X className="w-5 h-5 text-red-400" />
              <span className="font-semibold text-red-300">Stoß</span>
            </div>
            <p className="text-sm text-zinc-400">
              Kugel zu früh losgelassen
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
