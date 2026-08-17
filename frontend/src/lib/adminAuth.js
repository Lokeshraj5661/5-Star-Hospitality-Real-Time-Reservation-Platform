// Simple auth helpers for the concierge admin console.
export const AUTH_KEY = "lvff-admin-token";

export const getToken = () => sessionStorage.getItem(AUTH_KEY);
export const setToken = (t) => sessionStorage.setItem(AUTH_KEY, t);
export const clearToken = () => sessionStorage.removeItem(AUTH_KEY);

export const authHeaders = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// Simple CAPTCHA generator — 5 chars, no easily confused glyphs.
const CAPTCHA_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const generateCaptcha = (len = 5) =>
  Array.from({ length: len }, () => CAPTCHA_ALPHABET[Math.floor(Math.random() * CAPTCHA_ALPHABET.length)]).join("");
