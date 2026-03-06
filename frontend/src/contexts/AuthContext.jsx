import { createContext, useContext, useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_BACKEND_URL || "";
const AuthContext = createContext(null);

function apiRequest(method, url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.onload = () => {
      let data;
      try { data = JSON.parse(xhr.responseText); } catch { data = {}; }
      resolve({ status: xhr.status, ok: xhr.status >= 200 && xhr.status < 300, data });
    };
    xhr.onerror = () => reject(new Error("Verbindungsfehler"));
    xhr.send(body);
  });
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("sw_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      apiRequest("GET", `${API_URL}/api/auth/me`, null, { Authorization: `Bearer ${token}` })
        .then(({ ok, data }) => {
          if (ok) { setUser(data); } else { logout(); }
          setLoading(false);
        })
        .catch(() => { logout(); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    const { ok, data } = await apiRequest("POST", `${API_URL}/api/auth/login`, formData);
    if (!ok) throw new Error(data.detail || "Login fehlgeschlagen");
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
    const { ok, data } = await apiRequest("POST", `${API_URL}/api/auth/register`, formData);
    if (!ok) throw new Error(data.detail || "Registrierung fehlgeschlagen");
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
