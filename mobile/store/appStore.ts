import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import storage from "./storage";
import sync from "@/services/sync";

export interface appState {
  loading: boolean;
  isSyncing: boolean;
  lastSynced: number;
  onboardingComplete: boolean;
  setLoading: (loading: boolean) => void;
  completeOnboarding: () => void;
  sync: () => void;
}

const appStore = create<appState>()(
  persist(
    (set) => ({
      loading: false,
      isSyncing: false,
      lastSynced: 0,
      onboardingComplete: false,
      setLoading: (loading) => set({loading}),
      completeOnboarding: () => set({ onboardingComplete: true }),
      sync: sync(set),
    }),
    {
      name: "app-store",
      storage: createJSONStorage(() => ({
        getItem: (key) => storage.getString(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      })),
    }
  )
);

export default appStore;
