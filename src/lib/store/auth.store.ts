import { create } from "zustand";

type User = { id: string; name: string };

type State = {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<State>((set) => ({
  user: null,
  login: (user) => {
    localStorage.setItem("nae_user", JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem("nae_user");
    set({ user: null });
  },
  hydrate: () => {
    const raw = localStorage.getItem("nae_user");
    set({ user: raw ? (JSON.parse(raw) as User) : null });
  }
}));
