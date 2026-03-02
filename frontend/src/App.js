import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import Portal from "@/pages/Portal";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Phases from "@/pages/Phases";
import Ausgangsstellung from "@/pages/Ausgangsstellung";
import Technique from "@/pages/Technique";
import Angleiten from "@/pages/Angleiten";
import Videos from "@/pages/Videos";
import OBrien from "@/pages/OBrien";
import Errors from "@/pages/Errors";
import MediaLibrary from "@/pages/MediaLibrary";
import AdminUsers from "@/pages/AdminUsers";

// Components
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function ProtectedRoute({ children, requiredApp }) {
  const { user, loading, hasAppAccess } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (requiredApp && !hasAppAccess(requiredApp)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center px-4">
        <div>
          <p className="text-zinc-400 text-lg mb-2">Kein Zugriff</p>
          <p className="text-zinc-500 text-sm">Sie haben keinen Zugang zu dieser App. Bitte kontaktieren Sie den Administrator.</p>
        </div>
      </div>
    );
  }
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (!user.is_admin) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Portal />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<ProtectedRoute requiredApp="kugelstoessen"><Home /></ProtectedRoute>} />
          <Route path="/phasen" element={<ProtectedRoute requiredApp="kugelstoessen"><Phases /></ProtectedRoute>} />
          <Route path="/ausgangsstellung" element={<ProtectedRoute requiredApp="kugelstoessen"><Ausgangsstellung /></ProtectedRoute>} />
          <Route path="/technik" element={<ProtectedRoute requiredApp="kugelstoessen"><Technique /></ProtectedRoute>} />
          <Route path="/angleiten" element={<ProtectedRoute requiredApp="kugelstoessen"><Angleiten /></ProtectedRoute>} />
          <Route path="/videos" element={<ProtectedRoute requiredApp="kugelstoessen"><Videos /></ProtectedRoute>} />
          <Route path="/obrien" element={<ProtectedRoute requiredApp="kugelstoessen"><OBrien /></ProtectedRoute>} />
          <Route path="/fehler" element={<ProtectedRoute requiredApp="kugelstoessen"><Errors /></ProtectedRoute>} />
          <Route path="/medien" element={<ProtectedRoute requiredApp="kugelstoessen"><MediaLibrary /></ProtectedRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-center" richColors />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
