import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ChevronRight,
  BookOpen,
  Target,
  Award
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Die 3 didaktischen Hauptaspekte
const DIDAKTIK_ASPEKTE = [
  {
    id: "erstvermittlung",
    title: "Didaktisch-methodische Aspekte der Erstvermittlung",
    description: "Grundlagen und Einführung in die Kugelstoß-Technik",
    icon: BookOpen,
    color: "blue"
  },
  {
    id: "reduktion",
    title: "Kugelstoßen aus dem Nachstellschritt seitwärts oder mit einem Impulsschritt",
    description: "Didaktische Reduktion - vereinfachte Bewegungsformen",
    icon: Target,
    color: "green"
  },
  {
    id: "obrien",
    title: "O'Brien-Technik",
    description: "Die Zieltechnik - vollständiger Bewegungsablauf",
    icon: Award,
    color: "amber"
  }
];

// Chronologische Bewegungsphasen für das Rollmenü
const BEWEGUNGSPHASEN = [
  { 
    id: "phasen", 
    title: "Phasenstruktur", 
    path: "/phasen",
    description: "Übersicht aller Bewegungsphasen"
  },
  { 
    id: "ausgangsstellung", 
    title: "1. Ausgangsstellung", 
    path: "/ausgangsstellung",
    description: "Rücken zur Stoßrichtung, Kugel am Hals"
  },
  { 
    id: "angleiten", 
    title: "2. Angleiten", 
    path: "/angleiten",
    description: "Nachstellschritt oder Impulsschritt"
  },
  { 
    id: "stossauslage", 
    title: "3. Stoßauslage", 
    path: "/technik",
    description: "Optimale Position vor dem Stoß"
  },
  { 
    id: "stoss", 
    title: "4. Stoß", 
    path: "/videos",
    description: "Beschleunigung und Abwurf"
  },
  { 
    id: "obrien", 
    title: "O'Brien-Technik", 
    path: "/obrien",
    description: "Zieltechnik - Gesamtbewegung"
  },
  { 
    id: "fehler", 
    title: "Fehlerbilder", 
    path: "/fehler",
    description: "Kardinalfehler und Korrekturen"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function Home() {
  useEffect(() => {
    document.title = "SportWissen | Kugelstoßen";
  }, []);

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/30 hover:border-blue-500/60",
        icon: "bg-blue-500/20 text-blue-400",
        text: "text-blue-400"
      },
      green: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30 hover:border-emerald-500/60",
        icon: "bg-emerald-500/20 text-emerald-400",
        text: "text-emerald-400"
      },
      amber: {
        bg: "bg-amber-500/10",
        border: "border-amber-500/30 hover:border-amber-500/60",
        icon: "bg-amber-500/20 text-amber-400",
        text: "text-amber-400"
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header mit Titel und Bild */}
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Bild links - kleiner */}
          <div className="w-full lg:w-1/4 flex-shrink-0">
            <div className="aspect-[3/4] rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800 cursor-pointer hover:scale-105 transition-transform">
              <img 
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80"
                alt="Kugelstoßen Demonstration"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-zinc-500 text-center mt-2">
              Platzhalter - Ihr Bild hier
            </p>
          </div>

          {/* Titel und Beschreibung rechts */}
          <div className="flex-1">
            <h1 className="font-oswald text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
              KUGELSTOẞEN
            </h1>
            
            {/* Die 3 didaktischen Aspekte */}
            <motion.div 
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {DIDAKTIK_ASPEKTE.map((aspekt, index) => {
                const colors = getColorClasses(aspekt.color);
                const Icon = aspekt.icon;
                
                return (
                  <motion.div
                    key={aspekt.id}
                    variants={itemVariants}
                    className={`
                      p-4 rounded-lg border transition-colors duration-300
                      ${colors.bg} ${colors.border}
                    `}
                    data-testid={`aspekt-${aspekt.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${colors.text}`}>
                          {aspekt.title}
                        </h3>
                        <p className="text-sm text-zinc-400 mt-1">
                          {aspekt.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Info für Lehrkräfte */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-xl bg-zinc-800/50 border border-zinc-700"
      >
        <h3 className="font-oswald text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-3">
          Für Lehrkräfte und Ausbildung
        </h3>
        <p className="text-zinc-300 text-sm leading-relaxed">
          Die Lern-App thematisiert ausgewählte didaktisch-methodische Inhalte des Vermittlungsprozesses – von der Reduktion zur Zieltechnik!
        </p>
      </motion.div>
    </div>
  );
}
