import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useMotionValue } from "framer-motion";

const MotionCtx = createContext(null);

const isTouchDevice = () =>
  typeof window !== "undefined" &&
  (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || "ontouchstart" in window);

export function MotionProvider({ children }) {
  const [supported, setSupported] = useState(false);
  const [granted, setGranted] = useState(false);
  const [needsPrompt, setNeedsPrompt] = useState(false);

  // Shared smoothed tilt values (scaled: 15° tilt -> ~5° / 0.33)
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const lastUpdate = useRef(0);
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const has = "DeviceOrientationEvent" in window;
    setSupported(has);
    const requiresAuth =
      has && typeof window.DeviceOrientationEvent?.requestPermission === "function";
    const mobile = isTouchDevice();
    if (!mobile) return; // desktop: skip gyro entirely
    if (has && !requiresAuth) setGranted(true);
    else if (requiresAuth) {
      // Ask once, after a brief beat, only if we haven't already
      const dismissed = sessionStorage.getItem("lvff-motion-dismissed");
      if (!dismissed) setNeedsPrompt(true);
    }
  }, []);

  useEffect(() => {
    if (!granted) return;
    const onOrient = (e) => {
      const now = performance.now();
      if (now - lastUpdate.current < 16) return; // throttle to 60Hz
      lastUpdate.current = now;
      const gamma = e.gamma || 0; // L/R: -90..90
      const beta = (e.beta || 0) - 30; // F/B normalised to typical hold
      const max = 15;
      const out = 1 / 3; // 15° in -> ~5° out
      target.current.x = Math.max(-1, Math.min(1, gamma / max)) * out;
      target.current.y = Math.max(-1, Math.min(1, beta / max)) * out;
    };
    window.addEventListener("deviceorientation", onOrient, { passive: true });

    let raf;
    const lerp = () => {
      const cx = tiltX.get();
      const cy = tiltY.get();
      // heavy/smooth easing
      tiltX.set(cx + (target.current.x - cx) * 0.08);
      tiltY.set(cy + (target.current.y - cy) * 0.08);
      raf = requestAnimationFrame(lerp);
    };
    raf = requestAnimationFrame(lerp);

    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      cancelAnimationFrame(raf);
    };
  }, [granted, tiltX, tiltY]);

  const requestPermission = useCallback(async () => {
    try {
      const Evt = typeof window !== "undefined" ? window.DeviceOrientationEvent : null;
      if (Evt && typeof Evt.requestPermission === "function") {
        const r = await Evt.requestPermission();
        setNeedsPrompt(false);
        if (r === "granted") {
          setGranted(true);
          return true;
        }
        return false;
      }
      if (supported) {
        setGranted(true);
        return true;
      }
    } catch {
      setNeedsPrompt(false);
    }
    return false;
  }, [supported]);

  const dismiss = useCallback(() => {
    setNeedsPrompt(false);
    try {
      sessionStorage.setItem("lvff-motion-dismissed", "1");
    } catch {
      /* ignore */
    }
  }, []);

  const haptics = {
    light: () => {
      try {
        navigator.vibrate?.(8);
      } catch {
        /* ignore */
      }
    },
    tick: () => {
      try {
        navigator.vibrate?.(4);
      } catch {
        /* ignore */
      }
    },
    medium: () => {
      try {
        navigator.vibrate?.(15);
      } catch {
        /* ignore */
      }
    },
    success: () => {
      try {
        navigator.vibrate?.([8, 30, 12]);
      } catch {
        /* ignore */
      }
    },
  };

  return (
    <MotionCtx.Provider
      value={{
        tiltX,
        tiltY,
        granted,
        needsPrompt,
        supported,
        requestPermission,
        dismiss,
        haptics,
      }}
    >
      {children}
    </MotionCtx.Provider>
  );
}

export function useMotion() {
  const ctx = useContext(MotionCtx);
  if (!ctx) {
    // Safe fallbacks for any consumer outside provider
    return {
      tiltX: { get: () => 0, set: () => {}, on: () => () => {} },
      tiltY: { get: () => 0, set: () => {}, on: () => () => {} },
      granted: false,
      needsPrompt: false,
      supported: false,
      requestPermission: async () => false,
      dismiss: () => {},
      haptics: { light: () => {}, tick: () => {}, medium: () => {}, success: () => {} },
    };
  }
  return ctx;
}
