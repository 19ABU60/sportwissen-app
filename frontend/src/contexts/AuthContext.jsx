import { createContext, useContext, useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_BACKEND_URL || "";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("sw_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => { setUser(data); setLoading(false); })
        .catch(() => { logout(); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    const res = await fetch(`${API_URL}/api/auth/login`, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Login fehlgeschlagen");
    localStorage.setItem("sw_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (email, password, name) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("name", name);
    const res = await fetch(`${API_URL}/api/auth/register`, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Registrierung fehlgeschlagen");
    return data;
  };

  const logout = () => {
    localStorage.removeItem("sw_token");
    setToken(null);
    setUser(null);
  };

  const hasAppAccess = (appId) => {
    if (!user) return false;
    if (user.is_admin) return true;
    return (user.allowed_apps || []).includes(appId);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, hasAppAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
