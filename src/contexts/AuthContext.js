import { createContext, useState, useEffect } from "react";
import { getTokenData, login, removeAuthData, getMe } from "../services/auth";
import { useContext } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authData, setAuthData] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tokenData = getTokenData();
    if (tokenData) {
      setAuthData(tokenData);
      getMe().then((userData) => setUser(userData))
      .catch((err) => console.error("GET /users/me falhou", err));
    }
  }, []);

  async function signIn(username, password) {
    await login(username, password);
    const tokenData = getTokenData();
    setAuthData(tokenData);

    const userData = await getMe();
    setUser(userData);
  
  }

  function signOut() {
    removeAuthData();
    setAuthData(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ authData, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}

