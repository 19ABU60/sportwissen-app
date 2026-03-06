import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Shield, ShieldOff, Trash2, Check, X, KeyRound, Clock, Circle } from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL || "";

const APP_OPTIONS = [
  { id: "kugelstoessen", label: "Kugelstoßen" },
  { id: "speakly", label: "Speakly-App" },
  { id: "planed", label: "PlanEd" },
];

function isOnline(lastActive) {
  if (!lastActive) return false;
  const diff = Date.now() - new Date(lastActive).getTime();
  return diff < 5 * 60 * 1000; // 5 Minuten
}

function formatExpiry(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function isExpired(dateStr) {
  if (!dateStr) return false;
  return new Date() > new Date(dateStr);
}

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetUserId, setResetUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [expiryUserId, setExpiryUserId] = useState(null);
  const [expiryDate, setExpiryDate] = useState("");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, { headers });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Auto-refresh every 30 seconds for online status
  useEffect(() => {
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const toggleActive = async (userId, isActive) => {
    const endpoint = isActive ? "deactivate" : "activate";
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/${endpoint}`, { method: "PUT", headers });
      if (res.ok) {
        toast.success(isActive ? "Benutzer gesperrt" : "Benutzer freigeschaltet");
        fetchUsers();
      }
    } catch (err) { toast.error("Fehler"); }
  };

  const updateApps = async (userId, apps) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/apps`, {
        method: "PUT", headers, body: JSON.stringify({ apps })
      });
      if (res.ok) {
        toast.success("App-Zugriff aktualisiert");
        fetchUsers();
      }
    } catch (err) { toast.error("Fehler"); }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Benutzer wirklich löschen?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, { method: "DELETE", headers });
      if (res.ok) { toast.success("Benutzer gelöscht"); fetchUsers(); }
    } catch (err) { toast.error("Fehler"); }
  };

  const resetPassword = async (userId) => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Passwort muss mindestens 6 Zeichen haben");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/reset-password`, {
        method: "PUT", headers, body: JSON.stringify({ new_password: newPassword })
      });
      if (res.ok) {
        toast.success("Passwort wurde zurückgesetzt");
        setResetUserId(null);
        setNewPassword("");
      } else {
        const data = await res.json();
        toast.error(data.detail || "Fehler");
      }
    } catch (err) { toast.error("Fehler beim Zurücksetzen"); }
  };

  const setAccessExpiry = async (userId) => {
    try {
      const body = expiryDate
        ? { access_expires: new Date(expiryDate + "T23:59:59Z").toISOString() }
        : { access_expires: null };
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/access-expires`, {
        method: "PUT", headers, body: JSON.stringify(body)
      });
      if (res.ok) {
        toast.success(expiryDate ? `Zugang befristet bis ${formatExpiry(expiryDate)}` : "Befristung entfernt");
        setExpiryUserId(null);
        setExpiryDate("");
        fetchUsers();
      }
    } catch (err) { toast.error("Fehler"); }
  };

  const toggleApp = (user, appId) => {
    const currentApps = user.allowed_apps || [];
    const newApps = currentApps.includes(appId)
      ? currentApps.filter(a => a !== appId)
      : [...currentApps, appId];
    updateApps(user.id, newApps);
  };

  const onlineCount = users.filter(u => isOnline(u.last_active)).length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-oswald text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-500" /> Benutzerverwaltung
        </h1>
        <div className="flex items-center gap-4 mt-1">
          <p className="text-zinc-400 text-sm">{users.length} Benutzer registriert</p>
          <p className="text-sm flex items-center gap-1.5">
            <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500" />
            <span className="text-green-400">{onlineCount} online</span>
          </p>
        </div>
      </motion.div>

      <div className="space-y-3" data-testid="users-list">
        {users.map((u) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-zinc-800/50 border rounded-lg p-4 ${
              u.is_admin ? "border-amber-500/30" : u.is_active ? "border-green-500/30" : "border-red-500/30"
            }`}
            data-testid={`user-card-${u.id}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {/* Online indicator */}
                  <Circle className={`w-2.5 h-2.5 flex-shrink-0 ${
                    isOnline(u.last_active) ? "fill-green-500 text-green-500" : "fill-zinc-600 text-zinc-600"
                  }`} />
                  <span className="font-medium text-white text-sm">{u.name || u.email.split("@")[0]}</span>
                  {u.is_admin && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">Admin</span>}
                  {u.is_active ? (
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Aktiv</span>
                  ) : (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">Gesperrt</span>
                  )}
                  {u.access_expires && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
                      isExpired(u.access_expires)
                        ? "bg-red-500/20 text-red-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}>
                      <Clock className="w-3 h-3" />
                      {isExpired(u.access_expires) ? "Abgelaufen" : `bis ${formatExpiry(u.access_expires)}`}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{u.email}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  Registriert: {new Date(u.created_at).toLocaleDateString("de-DE")}
                  {u.last_active && ` · Zuletzt aktiv: ${new Date(u.last_active).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`}
                </p>
              </div>

              {/* App Toggles */}
              {!u.is_admin && (
                <div className="flex flex-wrap gap-1.5">
                  {APP_OPTIONS.map((app) => {
                    const hasAccess = (u.allowed_apps || []).includes(app.id);
                    return (
                      <button
                        key={app.id}
                        onClick={() => toggleApp(u, app.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                          hasAccess
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-zinc-700/50 text-zinc-500 border border-zinc-600"
                        }`}
                        data-testid={`toggle-app-${u.id}-${app.id}`}
                      >
                        {hasAccess ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {app.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Actions */}
              {!u.is_admin && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => { setExpiryUserId(expiryUserId === u.id ? null : u.id); setExpiryDate(""); }}
                    className={`p-2 rounded transition-colors ${
                      u.access_expires ? "text-blue-400 hover:bg-blue-500/20" : "text-zinc-400 hover:bg-zinc-700"
                    }`}
                    title="Zugang befristen"
                    data-testid={`set-expiry-${u.id}`}
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setResetUserId(resetUserId === u.id ? null : u.id); setNewPassword(""); }}
                    className="p-2 rounded hover:bg-amber-500/20 text-amber-400 transition-colors"
                    title="Passwort zurücksetzen"
                    data-testid={`reset-pw-${u.id}`}
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleActive(u.id, u.is_active)}
                    className={`p-2 rounded transition-colors ${
                      u.is_active ? "hover:bg-red-500/20 text-red-400" : "hover:bg-green-500/20 text-green-400"
                    }`}
                    title={u.is_active ? "Sperren" : "Freischalten"}
                    data-testid={`toggle-active-${u.id}`}
                  >
                    {u.is_active ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="p-2 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Löschen"
                    data-testid={`delete-user-${u.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Access Expiry Inline */}
            <AnimatePresence>
              {expiryUserId === u.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-zinc-700/50"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-zinc-400">Zugang gültig bis:</span>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      data-testid={`expiry-date-${u.id}`}
                    />
                    <button
                      onClick={() => setAccessExpiry(u.id)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                      data-testid={`confirm-expiry-${u.id}`}
                    >
                      {expiryDate ? "Befristen" : "Befristung entfernen"}
                    </button>
                    {u.access_expires && (
                      <button
                        onClick={() => { setExpiryDate(""); setAccessExpiry(u.id); }}
                        className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs rounded-lg transition-colors"
                      >
                        Unbegrenzt setzen
                      </button>
                    )}
                    <button
                      onClick={() => setExpiryUserId(null)}
                      className="p-2 text-zinc-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password Reset Inline */}
            <AnimatePresence>
              {resetUserId === u.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-zinc-700/50"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Neues Passwort (min. 6 Zeichen)"
                      className="flex-1 bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      data-testid={`new-pw-input-${u.id}`}
                    />
                    <button
                      onClick={() => resetPassword(u.id)}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors"
                      data-testid={`confirm-reset-pw-${u.id}`}
                    >
                      Zurücksetzen
                    </button>
                    <button
                      onClick={() => { setResetUserId(null); setNewPassword(""); }}
                      className="p-2 text-zinc-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
