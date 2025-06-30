import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import overviewStore from "@/store/overviewStore";
import progressStore from "@/store/progressStore";
import colors from "@/constants/colors";
import { homeMenuButtons } from "@/types/interfaces";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

const HomeMenus = () => {
  const router = useRouter();
  const level = progressStore((state) => state.level);
  const { feathers, streak, willPower } = overviewStore(
    ({ feathers, streak, willPower }) => ({ feathers, streak, willPower })
  );
  const homeMenus: homeMenuButtons[] = [
    {
      Icon: MaterialIcons,
      icon: "score",
      label: level,
      path: "/home/alterEgo",
    },
    {
      Icon: MaterialIcons,
      icon: "monetization-on",
      label: feathers,
      path: "/home/shop",
    },
    {
      Icon: MaterialIcons,
      icon: "whatshot",
      label: streak,
      path: "/home/streak",
    },
    {
      Icon: MaterialCommunityIcons,
      icon: "brain",
      label: willPower,
      path: "/home/willpower",
    },
    {
      Icon: MaterialIcons,
      icon: "sell",
      label: "PRO",
      path: "/home/plan",
    },
  ];

  return (
    <>
      {homeMenus.map((button, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            router.push(button.path);
          }}
          className="flex-row items-center justify-center p-2 rounded-md"
        >
          <button.Icon name={button.icon} size={24} color={colors.primary} />
          <Text className="text-textSecondary ml-2">{button.label}</Text>
          {button.notify && (
            <View
              className={`
                absolute w-2 h-2 bg-primaryDark rounded-full top-0 right-0
              `}
            />
          )}
        </TouchableOpacity>
      ))}
    </>
  );
};

export default HomeMenus;
