import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Pages
import Home from "@/pages/Home";
import Phases from "@/pages/Phases";
import Ausgangsstellung from "@/pages/Ausgangsstellung";
import Technique from "@/pages/Technique";
import Angleiten from "@/pages/Angleiten";
import Videos from "@/pages/Videos";
import OBrien from "@/pages/OBrien";
import Errors from "@/pages/Errors";

// Components
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-zinc-950">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/phasen" element={<Phases />} />
            <Route path="/ausgangsstellung" element={<Ausgangsstellung />} />
            <Route path="/technik" element={<Technique />} />
            <Route path="/angleiten" element={<Angleiten />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/obrien" element={<OBrien />} />
            <Route path="/fehler" element={<Errors />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-center" richColors />
      </div>
    </BrowserRouter>
  );
}

export default App;
