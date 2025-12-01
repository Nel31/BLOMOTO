import { create } from "zustand";

export type UserRole = "admin" | "garagiste" | "client";

export interface UserInfo {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  garageId?: string | null;
  phone?: string;
  avatar?: string;
}

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  setToken: (t: string | null) => void;
  setUser: (u: UserInfo | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  user: null,
  setToken: (t) => {
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
    set({ token: t });
  },
  setUser: (u) => set({ user: u }),
  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },
}));
