import league from "@/services/league";
import { create } from "zustand";

interface player {
  position: number;
  name: string;
  profileUri: string;
  xp: number;
}

interface leagueLevel {
  name: string;
  level: number;
  imgUri: string;
  active: boolean;
}

export interface leagueData {
  loading: boolean;
  leagueID: string;
  leagueData: leagueLevel[]
  promotionZone: player[];
  sameZone: player[];
  demotionZone: player[];
  setLeagueID: (id: string) => void;
}

const leagueStore = create<leagueData>((set) => ({
  leagueID: "",
  leagueData: [],
  loading: false,
  promotionZone: [],
  sameZone: [],
  demotionZone: [],
  fetch: () => league(set),
  setLeagueID: (leagueID) => set({leagueID})
}))

export default leagueStore