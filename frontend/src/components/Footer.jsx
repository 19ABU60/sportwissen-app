import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const isPortal = location.pathname === "/";

  return (
    <footer className="app-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          {/* Copyright */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600/20 flex items-center justify-center">
              <span className="text-blue-400 font-oswald font-bold text-xs">SW</span>
            </div>
            <span className="text-zinc-500">
              © A. Busse {currentYear} • SportWissen
            </span>
          </div>

          {/* Links - nur auf App-Seiten, nicht auf Portal */}
          {!isPortal && (
          <div className="flex items-center gap-6 text-sm">
            <span className="text-zinc-600">
              Didaktisch-methodische Lern-App
            </span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-500">
              Kugelstoßen • O'Brien-Technik
            </span>
          </div>
          )}
        </motion.div>

        {/* Patent/Info Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 pt-4 border-t border-zinc-800/50 text-center"
        >
          <p className="text-xs text-zinc-600">
            Alle Inhalte urheberrechtlich geschützt. Nutzung nur für Bildungszwecke gestattet.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
