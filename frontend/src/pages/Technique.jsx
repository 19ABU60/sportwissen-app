import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Info, ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import axios from "axios";
import { MediaUpload } from "@/components/MediaUpload";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Placeholder images for technique demonstration
const PLACEHOLDER_IMAGES = [
  {
    id: "img1",
    url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
    alt: "Professionelle Stoßauslage",
    isError: false,
  },
  {
    id: "img2",
    url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80",
    alt: "Schüler-Ausführung",
    isError: true,
  },
  {
    id: "img3",
    url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
    alt: "Stoßauslage Seitenansicht",
    isError: true,
  },
];

export default function Technique() {
  const [merkmale, setMerkmale] = useState([]);
  const [selections, setSelections] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Technik | SportWissen";
    fetchMerkmale();
  }, []);

  const fetchMerkmale = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API}/technik/merkmale`);
      setMerkmale(response.data);
    } catch (error) {
      console.error("Error fetching merkmale:", error);
      // Fallback data
      setMerkmale([
        { id: "m1", text: "Oberkörper 90 Grad zur Stoßrichtung gedreht" },
        { id: "m2", text: "Druckbein gebeugt" },
        { id: "m3", text: "Körpergewicht vollständig auf dem Druckbein" },
        { id: "m4", text: "Kugelhaltung - Oberarm in Verlängerung der Schulterachse" },
        { id: "m5", text: "Schulterachsenneigung" },
        { id: "m6", text: "Stemmbein - Druckbein leicht versetzt" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelection = (slotIndex, merkmalId) => {
    setSelections((prev) => ({
      ...prev,
      [slotIndex]: merkmalId,
    }));
  };

  const checkAnswers = () => {
    const filledSlots = Object.keys(selections).length;
    if (filledSlots < 2) {
      toast.warning("Bitte wähle mindestens 2 Merkmale aus");
      return;
    }
    toast.success("Gut gemacht! Deine Auswahl wurde gespeichert.");
  };

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
          <ChevronRight className="w-4 h-4" />
          <span className="text-zinc-300">Phase 3</span>
        </div>
        <h1 className="font-oswald text-3xl md:text-4xl font-bold tracking-tight uppercase text-white mb-2">
          3. Stoßauslage
        </h1>
        <p className="text-zinc-400">
          Erkenne die Technikmerkmale auf den Bildern und ordne sie zu
        </p>
      </motion.div>

      {/* Images Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 md:p-6 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bild 1 */}
          <div className="relative rounded-lg overflow-hidden border-2 border-zinc-700">
            <MediaUpload
              page="stossauslage"
              section="bild1"
              mediaType="image"
              aspectRatio="aspect-[4/3]"
              placeholderText="Bild 1 einfügen"
            />
            <div className="p-2 bg-zinc-800/50">
              <p className="text-white text-sm font-medium">Bild 1</p>
              <p className="text-zinc-400 text-xs">Professionelle Stoßauslage</p>
            </div>
          </div>

          {/* Bild 2 */}
          <div className="relative rounded-lg overflow-hidden border-2 border-zinc-700">
            <MediaUpload
              page="stossauslage"
              section="bild2"
              mediaType="image"
              aspectRatio="aspect-[4/3]"
              placeholderText="Bild 2 einfügen"
            />
            <div className="p-2 bg-zinc-800/50">
              <p className="text-white text-sm font-medium">Bild 2</p>
              <p className="text-zinc-400 text-xs">Schüler-Ausführung</p>
            </div>
          </div>

          {/* Bild 3 */}
          <div className="relative rounded-lg overflow-hidden border-2 border-zinc-700">
            <MediaUpload
              page="stossauslage"
              section="bild3"
              mediaType="image"
              aspectRatio="aspect-[4/3]"
              placeholderText="Bild 3 einfügen"
            />
            <div className="p-2 bg-zinc-800/50">
              <p className="text-white text-sm font-medium">Bild 3</p>
              <p className="text-zinc-400 text-xs">Stoßauslage Seitenansicht</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Selection Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 md:p-6"
      >
        <h2 className="font-oswald text-lg font-semibold uppercase tracking-wide text-zinc-300 mb-6">
          Ordne die Technikmerkmale zu
        </h2>

        <div className="space-y-4">
          {[1, 2].map((slotIndex) => (
            <div key={slotIndex} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 font-oswald font-bold">
                  {slotIndex}
                </span>
              </div>
              <Select
                value={selections[slotIndex] || ""}
                onValueChange={(value) => handleSelection(slotIndex, value)}
              >
                <SelectTrigger
                  className="w-full bg-zinc-800 border-zinc-700 text-white"
                  data-testid={`merkmal-select-${slotIndex}`}
                >
                  <SelectValue placeholder="Merkmal auswählen..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {merkmale.map((m) => (
                    <SelectItem
                      key={m.id}
                      value={m.id}
                      className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                    >
                      {m.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <Button
          onClick={checkAnswers}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-oswald uppercase tracking-wider"
          data-testid="check-technique-btn"
        >
          <Check className="w-4 h-4 mr-2" />
          Auswahl bestätigen
        </Button>
      </motion.div>

      {/* Question Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 md:p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-oswald text-lg font-semibold text-amber-300 mb-2">
              Erkennst du auf Bild 2 und 3 die Kardinalfehler?
            </h3>
            <p className="text-zinc-400 text-sm">
              Klicke auf das Info-Symbol bei den Bildern, um mehr zu erfahren.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex justify-between items-center"
      >
        <Link to="/angleiten">
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Zurück: 2. Angleiten
          </Button>
        </Link>
        <Link to="/videos">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Weiter: 4. Stoß
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
