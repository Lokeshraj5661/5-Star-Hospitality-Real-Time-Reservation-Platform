import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import AdminPortal from "@/pages/AdminPortal";
import AuthCallback from "@/pages/AuthCallback";
import { Toaster } from "@/components/ui/sonner";
import { MotionProvider } from "@/context/MotionContext";
import { AuthProvider } from "@/context/AuthContext";
import MotionInvite from "@/components/lvff/MotionInvite";

// Detect Google OAuth return via hash fragment BEFORE any route renders
function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/portal" element={<AdminPortal />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  return (
    <div className="App">
      <AuthProvider>
        <MotionProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
          <MotionInvite />
          <Toaster theme="dark" position="bottom-center" />
        </MotionProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
