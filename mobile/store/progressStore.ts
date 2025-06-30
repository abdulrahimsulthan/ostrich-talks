import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import storage from "./storage";

export interface progressState {
  level: number;
  title: string;
  completed: number;
  home: number;
  social: number;
  office: number;
  levelsOnDay: number;
  leadership: number;
  setProgress: (data: progressState) => void
}

const progressStore = create<progressState>()(
  persist(
    (set) => ({
      level: 1,
      title: "Seeker",
      completed: 0,
      home: 0,
      social: 0,
      office: 0,
      leadership: 0,
      levelsOnDay: 0,
      setProgress: (data) => set(data),
    }),
    {
      name: "progress-store",
      storage: createJSONStorage(() => ({
        getItem: (key) => storage.getString(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      })),
    }
  )
);

export default progressStore;
