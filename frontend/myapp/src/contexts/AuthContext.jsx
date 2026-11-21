import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { api, setToken as persistToken, getToken } from "../lib/apiClient.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/auth/me");
        if (!cancelled) setUser(res.user || null);
      } catch {
        if (!cancelled) {
          persistToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    persistToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const adminLogin = useCallback(async (email, password) => {
    const res = await api.post("/auth/admin-login", { email, password });
    persistToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await api.post("/auth/register", payload);
    persistToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    persistToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      login,
      adminLogin,
      register,
      logout,
      updateUser,
    }),
    [user, loading, login, adminLogin, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}