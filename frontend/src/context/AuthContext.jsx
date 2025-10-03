import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext();
const USER_KEY = "dk_user";

function readUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); }
  catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readUser()); // null si no hay sesión

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  const login = (u) => setUser(u);
  const logout = () => setUser(null);

  const value = useMemo(() => ({
    user,
    isLoggedIn: !!user,
    isAdmin: user?.role === "admin",
    login, logout, setUser,
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
