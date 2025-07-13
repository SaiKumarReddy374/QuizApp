import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await axios.get("/auth/check");
      if (res.data?.success) setToken(true);
      else setToken(null);
    } catch {
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => setToken(true); // ✅ Make sure this is defined
  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      setToken(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ✅ This is critical!
export const useAuth = () => useContext(AuthContext);
