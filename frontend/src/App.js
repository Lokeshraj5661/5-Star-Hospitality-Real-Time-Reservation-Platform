import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import { Toaster } from "@/components/ui/sonner";

function App() {
  useEffect(() => {
    // Soft smooth scroll without the broken react-lenis dep on React 19
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
      <Toaster theme="dark" position="bottom-center" />
    </div>
  );
}

export default App;
