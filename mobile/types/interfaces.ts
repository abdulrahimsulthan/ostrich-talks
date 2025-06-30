import { Href } from "expo-router";

export interface homeMenuButtons {
  Icon: any;
  icon: string;
  label: number | string;
  path: Href;
  notify?: boolean;
}
