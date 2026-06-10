import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import { Toaster } from "@/components/ui/sonner";
import { MotionProvider } from "@/context/MotionContext";
import MotionInvite from "@/components/lvff/MotionInvite";

function App() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  return (
    <div className="App">
      <MotionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </BrowserRouter>
        <MotionInvite />
        <Toaster theme="dark" position="bottom-center" />
      </MotionProvider>
    </div>
  );
}

export default App;
