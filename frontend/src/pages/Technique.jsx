import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { MediaUpload } from "@/components/MediaUpload";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Beispiel-Musterlösungen für die Bilder (Koordinaten sind relativ zur Bildgröße)
const SOLUTION_MARKERS_BILD1 = [
  { type: "circle", x: 180, y: 200, x2: 210, y2: 230, color: "#ef4444", label: "Druckbein gebeugt" },
  { type: "arrow", x: 100, y: 100, x2: 150, y2: 150, color: "#3b82f6", label: "Schulterachse" },
  { type: "circle", x: 250, y: 80, x2: 280, y2: 110, color: "#22c55e", label: "Kugelhaltung" },
];

export default function Technique() {
  const [activeImage, setActiveImage] = useState(1);
  const [imageUrls, setImageUrls] = useState({
    bild1: null,
    bild2: null,
    bild3: null
  });

  useEffect(() => {
    document.title = "Stoßauslage | SportWissen";
    // Fetch existing images
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const sections = ["bild1", "bild2", "bild3"];
      for (const section of sections) {
        const response = await fetch(`${API}/media/stossauslage/${section}`);
        if (response.ok) {
          const data = await response.json();
          if (data?.url) {
            setImageUrls(prev => ({
              ...prev,
              [section]: `${process.env.REACT_APP_BACKEND_URL}${data.url}`
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const handleImageChange = (section, media) => {
    if (media?.url) {
      setImageUrls(prev => ({
        ...prev,
        [section]: `${process.env.REACT_APP_BACKEND_URL}${media.url}`
      }));
    } else {
      setImageUrls(prev => ({
        ...prev,
        [section]: null
      }));
    }
  };

  const images = [
    { 
      id: 1, 
      section: "bild1",
      title: "Stoßauslage",
      tasks: [
        "Merkmale der Stoßauslage",
        "Das gebeugte Druckbein",
        "Die Schulterachsenneigung",
        "Die Kugelhaltung",
        "Welches Bein trägt das Körpergewicht?",
        "Das Stemmbein"
      ],
      solutions: SOLUTION_MARKERS_BILD1
    },
    { 
      id: 2, 
      section: "bild2",
      title: "Schüler-Ausführung",
      tasks: [
        "Unterschiede zur korrekten Technik",
        "Fehler in der Beinstellung",
        "Fehler in der Armhaltung",
        "Fehler in der Körperhaltung"
      ],
      solutions: []
    },
  ];

  const currentImage = images.find(img => img.id === activeImage);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <h1 className="font-oswald text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
          3. Stoßauslage
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Image thumbnails for upload */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 space-y-4"
        >
          {images.map((img) => (
            <div 
              key={img.id}
              className={`rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${
                activeImage === img.id 
                  ? "border-blue-500" 
                  : "border-zinc-700 hover:border-zinc-500"
              }`}
              onClick={() => setActiveImage(img.id)}
            >
              <MediaUpload
                page="stossauslage"
                section={img.section}
                mediaType="image"
                aspectRatio="aspect-[4/3]"
                placeholderText="Bild einfügen"
                onMediaChange={(media) => handleImageChange(img.section, media)}
              />
            </div>
          ))}
        </motion.div>

        {/* Right: Drawing canvas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <DrawingCanvas
              imageSrc={imageUrls[currentImage?.section]}
              imageAlt={currentImage?.title}
              tasks={currentImage?.tasks || ["Markiere die Technikmerkmale"]}
              solutionMarkers={currentImage?.solutions || []}
              title="Zeichne wesentliche Merkmale der Stoßauslage ins Bild!"
            />
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
