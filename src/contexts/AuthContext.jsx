// src/contexts/AuthContext.jsx
// Holds the login token so any component can read it without prop drilling.
import { createContext, useContext, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export function AuthContextProvider({ children }) {
  // Kept in memory only: a page refresh logs the user out
  const [token, setToken] = useState(null);

  const value = useMemo(() => {
    // The payload is readable without the secret; only the backend can verify it
    const user = token ? jwtDecode(token) : null;
    return {
      token,
      setToken,
      username: user?.username ?? null,
      userId: user?.userId ?? null,
    };
  }, [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
