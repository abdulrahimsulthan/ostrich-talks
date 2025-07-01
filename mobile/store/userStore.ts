import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import storage from "./storage";
import api from "@/lib/api";
import { User, UserStoreState } from "@/types/interfaces";
import { getAuth, signInWithEmailAndPassword, signOut } from '@react-native-firebase/auth';

interface UserStoreState {
  user: User | null;
  idToken: string | null;
  isLoading: boolean;
  error: string | null;
  name: string;
  email: string;
  uid: string;
  photoURL: string | null;
  // Actions
  setUser: (user: User | null) => void;
  setIdToken: (token: string | null) => void;
  fetchUserProfile: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  clearUser: () => void;
}

const userStore = create<UserStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        idToken: storage.getString('firebase_id_token') || null,
        isLoading: false,
        error: null,
        name: '',
        email: '',
        uid: '',
        photoURL: null,

        setUser: (user) => set({ user }),
        setIdToken: (token) => {
          if (token) {
            storage.set('firebase_id_token', token);
          } else {
            storage.delete('firebase_id_token');
          }
          set({ idToken: token });
        },

        fetchUserProfile: async () => {
          set({ isLoading: true, error: null });
          try {
            // Backend expects Firebase ID token in Authorization header
            const user = await api.get('/users/profile');
            set({ user, isLoading: false });
          } catch (error: any) {
            set({ error: error.message || 'Failed to fetch user profile', isLoading: false });
          }
        },

        loginWithEmail: async (email, password) => {
          set({ isLoading: true, error: null });
          try {
            const credential = await signInWithEmailAndPassword(getAuth(), email, password);
            const idToken = await credential.user.getIdToken();
            get().setIdToken(idToken);
            await get().fetchUserProfile();
            set({ isLoading: false });
          } catch (error: any) {
            set({ error: error.message || 'Login failed', isLoading: false });
            throw error;
          }
        },

        logout: async () => {
          set({ isLoading: true });
          try {
            await signOut(getAuth());
          } catch (error) {
            // Ignore
          } finally {
            get().setIdToken(null);
            set({ user: null, isLoading: false, error: null });
          }
        },

        clearError: () => set({ error: null }),

        clearUser: () => set({ name: '', email: '', uid: '', photoURL: null }),
      }),
      {
        name: "user-store",
        storage: createJSONStorage(() => ({
          getItem: (key) => storage.getString(key) ?? null,
          setItem: (key, value) => storage.set(key, value),
          removeItem: (key) => storage.delete(key),
        })),
        partialize: (state) => ({ user: state.user, idToken: state.idToken }),
      }
    )
  )
);

export default userStore;
