import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./context";

const api = (path, options = {}) => fetch(path, { credentials: "include", ...options });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api("/api/auth/session")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (active) setUser(data?.user ?? null); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const signIn = useCallback(async (email, password, rememberMe) => {
    const response = await api("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, remember_me: rememberMe }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || "Connexion impossible. Réessayez.");
    setUser(data.user);
  }, []);

  const signOut = useCallback(async () => {
    try { await api("/api/auth/logout", { method: "POST" }); } finally { setUser(null); }
  }, []);

  const value = useMemo(() => ({ user, loading, signIn, signOut }), [user, loading, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

