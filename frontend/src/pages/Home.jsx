import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Layers, 
  Target, 
  Play, 
  AlertTriangle, 
  ArrowRight,
  Video
} from "lucide-react";

const menuItems = [
  {
    id: "phasen",
    title: "Phasen des Kugelstoßens",
    description: "Ordne die Bewegungsphasen in die richtige Reihenfolge",
    icon: Layers,
    path: "/phasen",
    span: "col-span-12 md:col-span-8",
    featured: true,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80"
  },
  {
    id: "technik",
    title: "Stoßauslage",
    description: "Technikmerkmale erkennen und zuordnen",
    icon: Target,
    path: "/technik",
    span: "col-span-12 md:col-span-4",
    featured: false
  },
  {
    id: "angleiten",
    title: "Angleiten",
    description: "Videos und Übungen zum Angleiten",
    icon: Play,
    path: "/angleiten",
    span: "col-span-12 md:col-span-4",
    featured: false
  },
  {
    id: "videos",
    title: "Gesamtbewegung",
    description: "Die O'Brien-Technik im Überblick",
    icon: Video,
    path: "/videos",
    span: "col-span-12 md:col-span-4",
    featured: false
  },
  {
    id: "fehler",
    title: "Fehlerbilder",
    description: "Antizipierte Fehler erkennen und korrigieren",
    icon: AlertTriangle,
    path: "/fehler",
    span: "col-span-12 md:col-span-4",
    featured: false
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Hero Section */}
      <motion.div 
        className="mb-12 md:mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-oswald text-4xl md:text-6xl font-bold tracking-tight uppercase text-white mb-4">
          Kugelstoßen
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl">
          Didaktisch-methodische Aufbereitung zur Erstvermittlung der 
          <span className="text-blue-400 font-medium"> O'Brien-Technik</span>
        </p>
      </motion.div>

      {/* Bento Grid */}
      <motion.div 
        className="grid grid-cols-12 gap-4 md:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className={item.span}
            >
              <Link
                to={item.path}
                data-testid={`menu-${item.id}`}
                className={`
                  block h-full rounded-xl overflow-hidden
                  bg-zinc-900/50 border border-zinc-800
                  hover:border-blue-500/50 
                  transition-colors duration-300
                  group relative
                  ${item.featured ? 'min-h-[280px] md:min-h-[320px]' : 'min-h-[160px] md:min-h-[180px]'}
                `}
              >
                {/* Background Image for Featured */}
                {item.featured && item.image && (
                  <div className="absolute inset-0">
                    <img 
                      src={item.image} 
                      alt="" 
                      className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent" />
                  </div>
                )}
                
                {/* Content */}
                <div className={`
                  relative h-full p-6 md:p-8 flex flex-col justify-end
                  ${item.featured ? '' : 'justify-between'}
                `}>
                  {/* Icon */}
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center mb-4
                    ${item.featured 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-zinc-800 text-zinc-400 group-hover:text-blue-400 group-hover:bg-blue-500/20 transition-colors duration-300'
                    }
                  `}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  {/* Text */}
                  <div>
                    <h2 className={`
                      font-oswald font-bold uppercase tracking-wide text-white mb-2
                      ${item.featured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}
                    `}>
                      {item.title}
                    </h2>
                    <p className="text-zinc-400 text-sm md:text-base">
                      {item.description}
                    </p>
                  </div>
                  
                  {/* Arrow */}
                  <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-300">
                      <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Info Section */}
      <motion.div 
        className="mt-12 md:mt-16 p-6 md:p-8 rounded-xl bg-zinc-900/30 border border-zinc-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="font-oswald text-lg md:text-xl font-semibold uppercase tracking-wide text-zinc-300 mb-4">
          Über diese Lern-App
        </h3>
        <p className="text-zinc-400 leading-relaxed">
          Diese App unterstützt Schülerinnen und Schüler beim Erlernen der Kugelstoß-Technik 
          nach O'Brien. Die verschiedenen Module ermöglichen ein strukturiertes Üben der 
          Bewegungsphasen, Technikmerkmale und typischen Fehlerbilder.
        </p>
      </motion.div>
    </div>
  );
}
