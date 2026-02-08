import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Pages
import Home from "@/pages/Home";
import Phases from "@/pages/Phases";
import Technique from "@/pages/Technique";
import Angleiten from "@/pages/Angleiten";
import Videos from "@/pages/Videos";
import Errors from "@/pages/Errors";

// Components
import Navigation from "@/components/Navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-zinc-950">
        <Header />
        <main className="flex-1 pb-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/phasen" element={<Phases />} />
            <Route path="/technik" element={<Technique />} />
            <Route path="/angleiten" element={<Angleiten />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/fehler" element={<Errors />} />
          </Routes>
        </main>
        <Footer />
        <Navigation />
        <Toaster position="top-center" richColors />
      </div>
    </BrowserRouter>
  );
}

export default App;
