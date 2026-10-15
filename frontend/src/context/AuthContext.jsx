import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../services/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const refreshCustomer = useCallback(async () => {
    try { const { data } = await api.get("/customers/me"); setCustomer(data.customer); return data.customer; }
    catch { setCustomer(null); return null; }
    finally { setAuthLoading(false); }
  }, []);
  useEffect(() => { refreshCustomer(); }, [refreshCustomer]);
  const logout = async () => {
    try { await api.post("/customers/logout"); } finally { setCustomer(null); }
  };
  return <AuthContext.Provider value={{ customer, setCustomer, authLoading, refreshCustomer, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
