import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Shield, ShieldOff, Trash2, Check, X, KeyRound } from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL || "";

const APP_OPTIONS = [
  { id: "kugelstoessen", label: "Kugelstoßen" },
  { id: "speakly", label: "Speakly-App" },
  { id: "planed", label: "PlanEd" },
];

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetUserId, setResetUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");

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

  const toggleApp = (user, appId) => {
    const currentApps = user.allowed_apps || [];
    const newApps = currentApps.includes(appId)
      ? currentApps.filter(a => a !== appId)
      : [...currentApps, appId];
    updateApps(user.id, newApps);
  };

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
        <p className="text-zinc-400 text-sm mt-1">{users.length} Benutzer registriert</p>
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
                  <span className="font-medium text-white text-sm">{u.name || u.email.split("@")[0]}</span>
                  {u.is_admin && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">Admin</span>}
                  {u.is_active ? (
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Aktiv</span>
                  ) : (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">Gesperrt</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{u.email}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  Registriert: {new Date(u.created_at).toLocaleDateString("de-DE")}
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
