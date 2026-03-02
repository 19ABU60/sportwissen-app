import { motion } from "framer-motion";
import { useEffect } from "react";
import { ArrowRight, Globe, BookOpen, Calendar } from "lucide-react";

const apps = [
  {
    name: "Kugelstoßen",
    subtitle: "O'Brien-Technik Lern-App",
    description: "Interaktive Übungen, Videoanalyse und Fehlerkorrektur für den Sportunterricht",
    icon: BookOpen,
    href: "/home",
    isInternal: true,
    color: "from-amber-500 to-orange-600",
    borderColor: "border-amber-500/30",
    hoverBorder: "hover:border-amber-500/60",
  },
  {
    name: "Speakly-App",
    subtitle: "Sprachtraining",
    description: "Sprachkompetenz trainieren und verbessern",
    icon: Globe,
    href: "https://speakly-app-beta.vercel.app",
    isInternal: false,
    color: "from-blue-500 to-cyan-600",
    borderColor: "border-blue-500/30",
    hoverBorder: "hover:border-blue-500/60",
  },
  {
    name: "PlanEd",
    subtitle: "Unterrichtsplanung",
    description: "Unterricht planen und organisieren",
    icon: Calendar,
    href: "http://187.77.64.225:3000/login",
    isInternal: false,
    color: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-500/30",
    hoverBorder: "hover:border-emerald-500/60",
  },
];

export default function Portal() {
  useEffect(() => {
    document.title = "SportWissen | App-Portal";
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="font-oswald text-4xl sm:text-5xl font-bold tracking-tight text-white mb-3">
          Sport<span className="text-amber-500">Wissen</span>
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-md mx-auto">
          Digitale Werkzeuge für modernen Unterricht
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
        {apps.map((app, index) => {
          const Icon = app.icon;
          const Tag = app.isInternal ? "a" : "a";

          return (
            <motion.a
              key={app.name}
              href={app.href}
              target={app.isInternal ? "_self" : "_blank"}
              rel={app.isInternal ? undefined : "noopener noreferrer"}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * (index + 1) }}
              className={`group relative bg-zinc-900/80 border-2 ${app.borderColor} ${app.hoverBorder} rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-xl cursor-pointer`}
              data-testid={`app-card-${app.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-oswald text-xl font-bold text-white mb-1">
                {app.name}
              </h2>
              <p className="text-sm text-zinc-400 mb-3">
                {app.subtitle}
              </p>
              <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                {app.description}
              </p>
              <div className={`flex items-center gap-1 text-sm font-medium bg-gradient-to-r ${app.color} bg-clip-text text-transparent group-hover:gap-2 transition-all`}>
                <span>Öffnen</span>
                <ArrowRight className="w-4 h-4 text-current opacity-70" />
              </div>
              {!app.isInternal && (
                <span className="absolute top-3 right-3 text-[9px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">
                  extern
                </span>
              )}
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
