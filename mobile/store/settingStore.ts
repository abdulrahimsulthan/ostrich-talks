import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import storage from "./storage";

export interface settingState {
  notify: boolean;
  setNotify: (notify: boolean) => void
}

const settingStore = create<settingState>()(
  persist(
    (set) => ({
      notify: false,
      setNotify: (notify) => set({notify})
    }),
    {
      name: "setting-store",
      storage: createJSONStorage(() => ({
        getItem: (key) => storage.getString(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      })),
    }
  )
);

export default settingStore;
