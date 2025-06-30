import { leagueData } from "@/store/leagueStore";
import { ZustandSet } from "@/types";

export default (set: ZustandSet<leagueData>) => async () => {
  set({ loading: true });
  try {
    set({  });
  } catch (message) {
    console.error({ from: "sync", message });
  } finally {
    set({ loading: false });
  }
};