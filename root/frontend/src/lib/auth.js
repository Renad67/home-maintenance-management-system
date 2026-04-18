import { useState, useEffect } from "react";

export function getAuthUser() {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event("auth-change"));
}

export function clearAuthSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth-change"));
}

export function useAuth() {
  const [user, setUser] = useState(getAuthUser());

  useEffect(() => {
    const handleAuthChange = () => setUser(getAuthUser());
    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    role: user?.role,
    logout: () => {
      clearAuthSession();
      window.location.href = "/login";
    },
  };
}