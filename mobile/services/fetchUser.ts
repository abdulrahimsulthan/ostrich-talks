import { userState } from "@/store/userStore";
import { ZustandSet } from "@/types";

export default (set: ZustandSet<userState>) => async () => {
  set({ loading: true });
  try {
    set({});
  } catch (message) {
    console.error({ from: "fetchUser", message });
  } finally {
    set({ loading: false });
  }
};