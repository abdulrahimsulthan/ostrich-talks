import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import storage from "./storage";
import fetchUser from "@/services/fetchUser";

export interface userState {
  id: string;
  name: string;
  profileUri: String;
  joined: number;
  followers: number;
  following: number;
  loading: boolean;
  setId: (id: string) => void
  fetchUser: () => Promise<void>;
}

const userStore = create<userState>()(
    persist(
      (set) => ({
        id: "",
        name: "John Doe",
        joined: Date.now(),
        profileUri: "",
        followers: 0,
        following: 0,
        loading: false,
        setId: (id) => set({id}),
        fetchUser: fetchUser(set),
      }),
      {
        name: "user-store",
        storage: createJSONStorage(() => ({
          getItem: (key) => storage.getString(key) ?? null,
          setItem: (key, value) => storage.set(key, value),
          removeItem: (key) => storage.delete(key),
        })),
      }
    )
);

export default userStore;
