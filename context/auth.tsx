import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  name: string;
  email: string;
  age?: string;
  height?: string;
  weight?: string;
  bloodGroup?: string;
  conditions?: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USERS_KEY = "aimedcare_users";
const SESSION_KEY = "aimedcare_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const sessionJson = await AsyncStorage.getItem(SESSION_KEY);
        if (sessionJson) {
          setUser(JSON.parse(sessionJson));
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users: (User & { password: string })[] = usersJson ? JSON.parse(usersJson) : [];
      const found = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (!found) return false;
      const { password: _pw, ...userWithoutPw } = found;
      setUser(userWithoutPw);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPw));
      return true;
    } catch {
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users: (User & { password: string })[] = usersJson ? JSON.parse(usersJson) : [];
      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return false;
      }
      const newUser: User & { password: string } = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
        name,
        email,
        password,
      };
      users.push(newUser);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      const { password: _pw, ...userWithoutPw } = newUser;
      setUser(userWithoutPw);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPw));
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    if (usersJson) {
      const users: (User & { password: string })[] = JSON.parse(usersJson);
      const idx = users.findIndex((u) => u.id === updated.id);
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...data };
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
    }
  };

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, updateProfile }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
