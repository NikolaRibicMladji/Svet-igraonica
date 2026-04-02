import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const setAuthData = (userData, token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }

    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const response = await api.get("/auth/me");

      if (response?.data?.user) {
        setUser(response.data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      } else {
        clearAuthData();
      }
    } catch (err) {
      console.error("Greška pri učitavanju korisnika:", err);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setError(null);

    try {
      const response = await api.post("/auth/register", userData);

      const token = response.data?.accessToken;
      const userDataRes = response.data?.user;

      setAuthData(userDataRes, token);

      return { success: true, user: userDataRes };
    } catch (err) {
      const msg = err?.response?.data?.message || "Greška pri registraciji.";
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const login = async (email, password) => {
    setError(null);

    try {
      const response = await api.post("/auth/login", {
        email,
        password, // 🔥 BITNO: backend očekuje password
      });

      const token = response.data?.accessToken;
      const userDataRes = response.data?.user;

      setAuthData(userDataRes, token);

      return { success: true, user: userDataRes };
    } catch (err) {
      const msg = err?.response?.data?.message || "Greška pri prijavi.";
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearAuthData();
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
