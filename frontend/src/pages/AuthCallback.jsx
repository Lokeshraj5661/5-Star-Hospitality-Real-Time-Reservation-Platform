import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) {
      navigate("/", { replace: true });
      return;
    }
    const sessionId = decodeURIComponent(match[1]);
    (async () => {
      try {
        const { data } = await axios.post(
          `${API}/auth/session`,
          {},
          { headers: { "X-Session-ID": sessionId }, withCredentials: true }
        );
        toast.success(`Welcome, ${data.name.split(" ")[0]}`);
        // Clear hash from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        await refresh();
        // Route based on admin flag
        navigate(data.is_admin ? "/admin" : "/", { replace: true });
      } catch {
        toast.error("Sign-in failed. Please try again.");
        navigate("/", { replace: true });
      }
    })();
  }, [location.hash, navigate, refresh]);

  return (
    <div className="min-h-screen bg-marble bg-noise flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border border-[var(--lvff-gold)] rounded-full border-t-transparent animate-spin" />
        <div className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)]">Opening the House…</div>
      </div>
    </div>
  );
}
