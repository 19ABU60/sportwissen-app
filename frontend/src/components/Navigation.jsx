import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Layers, Target, Play, Video, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { path: "/", icon: Home, label: "Übersicht" },
  { path: "/phasen", icon: Layers, label: "Phasen" },
  { path: "/technik", icon: Target, label: "Technik" },
  { path: "/angleiten", icon: Play, label: "Angleiten" },
  { path: "/videos", icon: Video, label: "Videos" },
  { path: "/fehler", icon: AlertTriangle, label: "Fehler" },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="nav-dock" data-testid="main-navigation">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        className="glass px-4 py-3 rounded-full flex items-center gap-1 md:gap-2"
      >
        <TooltipProvider>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    data-testid={`nav-${item.path.replace("/", "") || "home"}`}
                    className={`
                      relative p-3 rounded-full transition-colors duration-200
                      ${isActive 
                        ? "text-white bg-blue-600" 
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-full bg-blue-600 -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-zinc-800 text-white border-zinc-700">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </motion.div>
    </nav>
  );
};

export default Navigation;
