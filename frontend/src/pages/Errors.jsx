import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { MediaUpload } from "@/components/MediaUpload";

// Fehlerkategorien für jedes Bild (später vom Admin anpassbar)
const FEHLER_KATEGORIEN = {
  angleiten: [
    "Fehlerkategorie 1",
    "Fehlerkategorie 2",
    "Fehlerkategorie 3"
  ],
  stossauslage: [
    "Fehlerkategorie 1",
    "Fehlerkategorie 2",
    "Fehlerkategorie 3"
  ],
  drehstreck: [
    "Fehlerkategorie 1",
    "Fehlerkategorie 2",
    "Fehlerkategorie 3"
  ],
  abstoss: [
    "Fehlerkategorie 1",
    "Fehlerkategorie 2",
    "Fehlerkategorie 3"
  ]
};

function FehlerDropdown({ kategorien, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(0);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-zinc-700/50 border border-zinc-600 rounded px-2 py-1.5 hover:bg-zinc-700 transition-colors text-left"
      >
        <span className="text-zinc-300 text-xs truncate">
          {kategorien[selected]}
        </span>
        <ChevronDown className={`w-3 h-3 text-zinc-400 flex-shrink-0 ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-600 rounded overflow-hidden z-10 shadow-lg">
          {kategorien.map((kat, index) => (
            <button
              key={index}
              onClick={() => {
                setSelected(index);
                setIsOpen(false);
              }}
              className={`w-full text-left px-2 py-1.5 text-xs transition-colors ${
                selected === index 
                  ? "bg-amber-600 text-white" 
                  : "text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {kat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Errors() {
  useEffect(() => {
    document.title = "Fehlerbilder | SportWissen";
  }, []);

  const bilder = [
    { id: 1, section: "bild1", title: "1. Angleiten", kategorien: FEHLER_KATEGORIEN.angleiten },
    { id: 2, section: "bild2", title: "2. Stoßauslage", kategorien: FEHLER_KATEGORIEN.stossauslage },
    { id: 3, section: "bild3", title: "3. Dreh-Streck-Bewegung", kategorien: FEHLER_KATEGORIEN.drehstreck },
    { id: 4, section: "bild4", title: "4. Abstoß", kategorien: FEHLER_KATEGORIEN.abstoss },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
      </motion.div>

      {/* 4 Bilder Grid - 2x2, kleiner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {bilder.map((bild, index) => (
          <motion.div
            key={bild.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden"
          >
            <MediaUpload
              page="fehlerbilder"
              section={bild.section}
              mediaType="image"
              aspectRatio="aspect-square"
              placeholderText="Bild einfügen"
            />
            <div className="p-2 space-y-2">
              <h3 className="font-oswald text-sm font-semibold text-white">
                {bild.title}
              </h3>
              <FehlerDropdown kategorien={bild.kategorien} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Zurück Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <Link to="/">
          <button className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors text-sm">
            Zur Übersicht
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
