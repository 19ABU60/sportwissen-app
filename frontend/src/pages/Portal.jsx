import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Globe, BookOpen, Calendar, LogIn, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const apps = [
  {
    name: "Kugelstoßen",
    id: "kugelstoessen",
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
    id: "speakly",
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
    id: "planed",
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
  const { user, logout, hasAppAccess } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "SportWissen | App-Portal";
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-oswald text-4xl sm:text-5xl font-bold tracking-tight text-white mb-3">
          Sport<span className="text-amber-500">Wissen</span>
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-md mx-auto">
          Digitale Werkzeuge für modernen Unterricht
        </p>
      </motion.div>

      {/* Auth Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8 flex items-center gap-3"
      >
        {user ? (
          <>
            <span className="text-sm text-zinc-400">
              Angemeldet als <span className="text-white font-medium">{user.name || user.email}</span>
            </span>
            {user.is_admin && (
              <button
                onClick={() => navigate("/admin/users")}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-lg hover:bg-amber-500/20 transition-colors"
                data-testid="admin-btn"
              >
                <Shield className="w-3 h-3" /> Verwaltung
              </button>
            )}
            <button
              onClick={logout}
              className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs rounded-lg hover:bg-zinc-700 transition-colors"
              data-testid="logout-btn"
            >
              Abmelden
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors"
            data-testid="login-btn"
          >
            <LogIn className="w-4 h-4" /> Anmelden / Registrieren
          </button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
        {apps.map((app, index) => {
          const Icon = app.icon;
          const canAccess = user && hasAppAccess(app.id);
          const needsLogin = !user;

          const handleClick = (e) => {
            if (needsLogin) {
              e.preventDefault();
              navigate("/login");
            } else if (!canAccess) {
              e.preventDefault();
            }
          };

          return (
            <motion.a
              key={app.name}
              href={canAccess ? app.href : "#"}
              target={canAccess && !app.isInternal ? "_blank" : "_self"}
              rel={app.isInternal ? undefined : "noopener noreferrer"}
              onClick={handleClick}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * (index + 1) }}
              className={`group relative bg-zinc-900/80 border-2 ${app.borderColor} ${canAccess ? app.hoverBorder : ""} rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 ${
                canAccess ? "hover:scale-[1.03] hover:shadow-xl cursor-pointer" : needsLogin ? "cursor-pointer opacity-80" : "opacity-50 cursor-not-allowed"
              }`}
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
                <span>{canAccess ? "Öffnen" : needsLogin ? "Anmelden" : "Kein Zugang"}</span>
                {canAccess && <ArrowRight className="w-4 h-4 text-current opacity-70" />}
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
