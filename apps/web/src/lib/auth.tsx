"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api, clearToken, getToken, setToken } from "./api";

export type Me = {
  id: string;
  email: string;
  username: string;
  role: string;
  plan: string;
  emailVerified: boolean;
  displayName?: string;
  onboarding?: { completed?: boolean; vertical?: string; targetRole?: string; intent?: string };
  consents?: {
    aiTrainingOptIn?: boolean;
    doNotSendToLlm?: boolean;
    talentDirectory?: boolean;
  };
};

const Ctx = createContext<{
  user: Me | null;
  loading: boolean;
  setAccess: (t: string) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}>({ user: null, loading: true, setAccess: () => undefined, refresh: async () => undefined, logout: async () => undefined });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      if (!getToken()) {
        const r = await api<{ accessToken: string; user: Me }>("/auth/refresh", { method: "POST" });
        setToken(r.accessToken);
        setUser(r.user);
        return;
      }
      const me = await api<Me>("/users/me");
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        setAccess: (t) => {
          setToken(t);
          refresh();
        },
        refresh,
        logout: async () => {
          await api("/auth/logout", { method: "POST" }).catch(() => undefined);
          clearToken();
          setUser(null);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
