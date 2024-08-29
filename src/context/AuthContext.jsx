import React, { createContext, useState, useContext } from "react";

export const AuthContext = createContext({
  user: null,
  setUser: () => {}, // Placeholder function, you'll implement the actual logic later
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
