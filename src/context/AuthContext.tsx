import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [hostel, setHostel] = useState(() => {
    const stored = localStorage.getItem("selectedHostel");
    return stored && stored !== "null" ? JSON.parse(stored) : null;
  });

  // Listen for the global logout event (triggered by axios interceptor)
  useEffect(() => {
    const handleLogout = () => {
      logout();
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const login = (jwt, userRole, userHostel = null) => {
    localStorage.setItem("token", jwt);
    localStorage.setItem("role", userRole);
    setToken(jwt);
    setRole(userRole);

    if (userHostel) {
      localStorage.setItem("selectedHostel", JSON.stringify(userHostel));
      if (userHostel.id) localStorage.setItem("selectedHostelId", userHostel.id);
      setHostel(userHostel);
    } else {
      localStorage.removeItem("selectedHostel");
      localStorage.removeItem("selectedHostelId");
      setHostel(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("selectedHostel");
    localStorage.removeItem("selectedHostelId");
    setToken(null);
    setRole(null);
    setHostel(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, hostel, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);