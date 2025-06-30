import { appState } from "@/store/appStore";
import { ZustandSet } from "@/types";

export default (set: ZustandSet<appState>) => async () => {
  set({ isSyncing: true });
  try {
    set({ lastSynced: Date.now() });
  } catch (message) {
    console.error({ from: "sync", message });
  } finally {
    set({ isSyncing: false });
  }
};