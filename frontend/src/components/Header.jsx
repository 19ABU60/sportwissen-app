import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="app-header py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
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

        {/* Desktop Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden md:block"
        >
          <span className="text-zinc-400 text-sm">
            O'Brien-Technik • Für Schülerinnen und Schüler
          </span>
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

        {/* Help/Info Button (Desktop) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:block"
        >
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
            data-testid="help-btn"
          >
            Hilfe
          </Button>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden mt-4 py-4 border-t border-zinc-800"
        >
          <nav className="flex flex-col gap-2">
            <Link
              to="/"
              className="px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Übersicht
            </Link>
            <Link
              to="/phasen"
              className="px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Phasen
            </Link>
            <Link
              to="/technik"
              className="px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Technik
            </Link>
            <Link
              to="/angleiten"
              className="px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Angleiten
            </Link>
            <Link
              to="/videos"
              className="px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Videos
            </Link>
            <Link
              to="/fehler"
              className="px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fehlerbilder
            </Link>
          </nav>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
