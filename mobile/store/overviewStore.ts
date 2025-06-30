import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import storage from "./storage";

export interface overviewState {
  feathers: number;
  willPower: number;
  xp: number;
  mistakes: number;
  streak: number;
  streakLevel:number;
  streakFreeze: number;
  streakGoal: number;
  friendStreak: number;
  league: string;
  leagueID: string;
  leagueWeek: number;
  setOverview: (data: Partial<overviewState>) => void;
}

const overviewStore = create<overviewState>()(
  persist(
    (set) => ({
      feathers: 0,
      willPower: 100,
      xp: 0,
      mistakes: 0,
      streak: 0,
      streakLevel: 0,
      streakFreeze: 0,
      streakGoal: 0,
      friendStreak: 0,
      league: "Bronze",
      leagueID: "",
      leagueWeek: 0,
      setOverview: (data) => set(data),
    }),
    {
      name: "overview-store",
      storage: createJSONStorage(() => ({
        getItem: (key) => storage.getString(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      })),
    }
  )
);

export default overviewStore;
