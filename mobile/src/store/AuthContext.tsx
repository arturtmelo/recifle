import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { User } from "../types";
import { loginRequest, meRequest, RegisterPayload, registerRequest } from "../services/auth.api";
import { clearToken, getToken, setToken } from "../services/storage";
import { connectSocket, disconnectSocket } from "../services/socket";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        try {
          const me = await meRequest();
          setUser(me);
          connectSocket(token);
        } catch {
          await clearToken();
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: loggedUser } = await loginRequest(email, password);
    await setToken(token);
    setUser(loggedUser);
    connectSocket(token);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { token, user: newUser } = await registerRequest(payload);
    await setToken(token);
    setUser(newUser);
    connectSocket(token);
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    disconnectSocket();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await meRequest();
    setUser(me);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, refreshUser, setUser }),
    [user, isLoading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
