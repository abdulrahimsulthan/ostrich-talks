import { View, Text, ScrollView } from "react-native";
import React from "react";
import { Image } from "expo-image";
import progressStore from "@/store/progressStore";

const alterEgo = () => {
  const { level, completed, home, social, office, leadership, title } =
    progressStore();
  const characters = [
    {
      name: "Heart Forge",
      type: "Home",
      completed: home,
    },
    {
      name: "Echo Flare",
      type: "Social",
      completed: social,
    },
    {
      name: "Task Born",
      type: "Office",
      completed: office,
    },
    {
      name: "Mind Spire",
      type: "Leadership",
      completed: leadership,
    },
  ];

  return (
    <ScrollView className="bg-background">
      <View className="flex-1 bg-background w-[90%] mx-auto ">
        {/* Alter Egos Header */}
        <View className="items-center justify-center gap-2 my-4 py-4">
          <Image
            source={require("@/assets/avatars/penguin.png")}
            style={{ width: 100, height: 120, borderRadius: 20 }}
          />
          <View className="w-[90%] flex-row items-center justify-between px-4">
            <Text className="font-bold">{level}</Text>
            <View className="flex-1 mx-4 h-4 bg-gray-300 rounded-full">
              <View
                className="h-4 bg-primary rounded-full"
                style={{ width: `${completed}%` }}
              />
            </View>
            <Text className="font-bold">{level + 1}</Text>
          </View>
          <Text className="">Your Level is {level}</Text>
          <Text className="text-lg font-bold">You are a {title}</Text>
        </View>

        <View>
          <Text className="text-xl font-bold">Your Alter Egos</Text>
        </View>
        {/* Alter Egos List */}
        {characters.map((item, key) => (
          <View
            className={`
                w-[90%] flex-row justify-start items-center 
                mx-auto gap-2 my-4
            `}
            key={key}
          >
            <Image
              source={require("@/assets/avatars/penguin.png")}
              style={{ width: 70, height: 70, borderRadius: 15 }}
            />
            <View className="justify-center w-[75%] gap-3 p-2">
              <Text className="font-semibold">
                {item.name} ( {item.type} )
              </Text>
              <View className="h-4 bg-gray-300 rounded-full">
                <View
                  className="h-4 bg-primary rounded-full"
                  style={{ width: `${item.completed}%` }}
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default alterEgo;
