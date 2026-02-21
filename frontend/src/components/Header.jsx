import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, ChevronDown, Home } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BEWEGUNGSPHASEN = [
  { title: "Übersicht", path: "/", description: "Startseite" },
  { title: "Phasenstruktur", path: "/phasen", description: "Alle Phasen im Überblick" },
  { title: "1. Ausgangsstellung", path: "/ausgangsstellung", description: "Start der Bewegung" },
  { title: "2. Angleiten", path: "/angleiten", description: "Nachstell-/Impulsschritt" },
  { title: "3. Stoßauslage", path: "/technik", description: "Optimale Position" },
  { title: "4. Stoß", path: "/videos", description: "Beschleunigung & Abstoß" },
  { title: "O'Brien-Technik", path: "/obrien", description: "Zieltechnik" },
  { title: "Fehlerbilder", path: "/fehler", description: "Korrekturen" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getCurrentPageTitle = () => {
    const current = BEWEGUNGSPHASEN.find(p => p.path === location.pathname);
    return current?.title || "Übersicht";
  };

  return (
    <header className="app-header py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3" data-testid="header-logo">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {/* Logo Icon */}
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-oswald font-bold text-xl">SW</span>
            </div>
            {/* Logo Text */}
            <div className="hidden sm:block">
              <h1 className="font-oswald text-xl font-bold tracking-wide text-white">
                SportWissen
              </h1>
              <p className="text-xs text-zinc-500 -mt-0.5">Kugelstoßen</p>
            </div>
          </motion.div>
        </Link>

        {/* Desktop Navigation - Rollmenü */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden md:flex items-center gap-4"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-800 min-w-[200px] justify-between"
                data-testid="header-dropdown"
              >
                <span className="font-medium">{getCurrentPageTitle()}</span>
                <ChevronDown className="w-4 h-4 ml-2 text-zinc-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-64 bg-zinc-900 border-zinc-700"
              align="center"
            >
              <DropdownMenuLabel className="text-zinc-400 font-oswald uppercase text-xs tracking-wider">
                Bewegungsphasen
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-700" />
              {BEWEGUNGSPHASEN.map((phase) => (
                <DropdownMenuItem key={phase.path} asChild>
                  <Link 
                    to={phase.path}
                    className={`
                      flex flex-col items-start py-2 cursor-pointer
                      ${location.pathname === phase.path 
                        ? "bg-blue-500/20 text-blue-400" 
                        : "hover:bg-zinc-800 focus:bg-zinc-800"
                      }
                    `}
                  >
                    <span className="font-medium text-white">{phase.title}</span>
                    <span className="text-xs text-zinc-500">{phase.description}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Home Button */}
          <Link to="/">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              data-testid="home-btn"
            >
              <Home className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-zinc-400 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="mobile-menu-btn"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden mt-4 py-4 border-t border-zinc-800"
        >
          <nav className="flex flex-col gap-1">
            {BEWEGUNGSPHASEN.map((phase) => (
              <Link
                key={phase.path}
                to={phase.path}
                className={`
                  px-4 py-3 rounded-lg flex flex-col
                  ${location.pathname === phase.path 
                    ? "bg-blue-500/20 text-blue-400" 
                    : "text-zinc-300 hover:bg-zinc-800"
                  }
                `}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="font-medium">{phase.title}</span>
                <span className="text-xs text-zinc-500">{phase.description}</span>
              </Link>
            ))}
          </nav>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
