import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, name);
        toast.success("Registrierung erfolgreich! Warten Sie auf die Freischaltung.");
        setIsRegister(false);
        setPassword("");
      } else {
        await login(email, password);
        toast.success("Willkommen!");
        navigate("/");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1 className="font-oswald text-3xl font-bold text-white mb-2">
            Sport<span className="text-amber-500">Wissen</span>
          </h1>
          <p className="text-zinc-400 text-sm">
            {isRegister ? "Neuen Account erstellen" : "Anmelden"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="auth-form">
          {isRegister && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                data-testid="register-name-input"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-Mail"
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              data-testid="email-input"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
              required
              minLength={6}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              data-testid="password-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
            data-testid="auth-submit-btn"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isRegister ? (
              <><UserPlus className="w-4 h-4" /> Registrieren</>
            ) : (
              <><LogIn className="w-4 h-4" /> Anmelden</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setPassword(""); }}
            className="text-sm text-zinc-400 hover:text-amber-500 transition-colors"
            data-testid="toggle-auth-mode"
          >
            {isRegister
              ? "Bereits registriert? Anmelden"
              : "Noch kein Account? Registrieren"}
          </button>
        </div>

        {isRegister && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-xs text-zinc-500 bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"
          >
            Nach der Registrierung muss Ihr Account vom Administrator freigeschaltet werden.
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
