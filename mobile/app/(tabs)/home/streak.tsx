import { View, Text, ScrollView, FlatList } from "react-native";
import React from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import colors from "@/constants/colors";
import { TouchableOpacity } from "react-native";
import overviewStore from "@/store/overviewStore";
interface invites {
  id: string;
  title: string;
  icon: "add";
}
const invites: invites[] = [
  {
    id: "1",
    title: "Invite a friend",
    icon: "add",
  },
  {
    id: "2",
    title: "Invite a friend",
    icon: "add",
  },
  {
    id: "3",
    title: "Invite a friend",
    icon: "add",
  },
  {
    id: "4",
    title: "Invite a friend",
    icon: "add",
  },
  {
    id: "5",
    title: "Invite a friend",
    icon: "add",
  },
];

const streak = () => {
  const { streak, streakGoal } = overviewStore();
  // TODO: Create a service to trigger some CTA or Notify banner
  return (
    <ScrollView>
      <View className="bg-background items-center justify-center">
        {/* streak banner */}
        <View
          className={`
          flex-row items-center justify-between bg-primary p-4 
          rounded-lg shadow-md my-4 w-[90%]
        `}
        >
          <View>
            <Text className="text-3xl text-white py-4">
              {streak} Day Streak
            </Text>
            <Text className="text-white mb-1">
              This is your longest streak, don't stop.
            </Text>
          </View>
          <MaterialIcons name="whatshot" size={40} color="white" />
        </View>

        {/* streak timer CTA for lessions*/}
        <View
          className={`
          flex-row items-center justify-start p-4 rounded-lg 
          shadow-md my-4 w-[90%]
        `}
        >
          <Ionicons name="timer-outline" size={24} color="red" />
          <View className="ml-2 p-2">
            <Text className="text-textPrimary">
              3 hours until your streak resets!
            </Text>
            <View className="flex-row items-center mt-2 gap-2">
              <TouchableOpacity className="bg-primary rounded-md px-4 py-2 mt-2 ">
                <Text className="text-center text-white font-bold">
                  Start Lession
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* streak history */}
        <View
          className={`
          flex-1 items-center justify-between bg-primary p-4 
          rounded-lg shadow-md my-4 w-[90%]
        `}
        >
          <View className="w-full flex-row items-center justify-between mb-2">
            <Text className="text-lg text-white">Streak Calendar</Text>
            <MaterialIcons name="history" size={24} color="white" />
          </View>
          <View
            className={`
            w-full flex-1 items-center justify-end bg-background 
            mt-4 h-[275] p-3 shadow-md rounded-lg
          `}
          >
            <View className="flex-row justify-end items-center w-full p-2">
              <Text className="text-lg text-primary">Last 7 days</Text>
              <MaterialIcons
                name="arrow-forward-ios"
                size={24}
                color={colors.primary}
              />
            </View>
          </View>
        </View>

        {/* Streak Goal */}
        <View
          className={`
          flex-1 items-center justify-between p-4 rounded-lg 
          shadow-md my-4 w-[90%]
        `}
        >
          <View className="w-full flex-row items-center justify-between p-2 mb-2">
            <Text className="text-xl text-primary">Streak Goal</Text>
          </View>
          <View className="flex-row mb-2 justify-between items-center w-full p-2">
            <Text className="text-xl text-wrap w-4/5">
              You're {streak} days into your {streakGoal} days goal
            </Text>
            <MaterialIcons name="surfing" size={40} color={colors.primary} />
          </View>
          <View className="flex-row mb-2">
            <View className="flex-1 mx-4 h-3 bg-gray-300 rounded-full">
              <View
                className="h-3 bg-primary rounded-full"
                style={{ width: `${(streak / streakGoal) * 100}%` }}
              />
            </View>
          </View>

          <View className="flex-row justify-end items-center w-full p-2">
            <Text className="text-lg text-primary">Set a goal</Text>
            <MaterialIcons
              name="arrow-forward-ios"
              size={24}
              color={colors.primary}
            />
          </View>
        </View>

        {/* Streak Society */}
        <View
          className={`
          flex-1 items-center justify-between p-4 rounded-lg 
          shadow-md my-4 w-[90%]
        `}
        >
          <View className="w-full flex-row items-center justify-between p-2 mb-2">
            <Text className="text-xl text-textSecondary">Streak Society</Text>
          </View>
          <View className="flex-row mb-2 justify-between items-center w-full p-2">
            <MaterialIcons name="lock" size={50} color={colors.textSecondary} />
            <Text className="text-xl text-wrap w-4/5 text-textSecondary">
              Reach a 7 day streak to join the Streak Society and earn exclusive
              rewards.
            </Text>
          </View>
        </View>

        {/* Friend Streaks */}
        <View
          className={`
          flex-1 items-center justify-between p-4 rounded-lg 
          shadow-md my-4 w-[90%]
        `}
        >
          <View className="w-full flex-row items-center justify-between p-2 mb-2">
            <Text className="text-xl text-textSecondary">Friend Streaks</Text>
          </View>

          <View className="flex-row mb-2 justify-between items-center w-full p-2">
            <MaterialIcons name="lock" size={50} color={colors.textSecondary} />
            <Text className="text-xl text-wrap w-4/5 text-textSecondary">
              You have no friends with streaks yet. Add some friends to see
              their streaks.
            </Text>
          </View>

          {invites.map((item) => (
            <View
              className="flex-row mb-2 justify-start items-center w-full p-2"
              key={item.id}
            >
              <MaterialIcons
                name={item.icon}
                size={30}
                color={colors.textSecondary}
              />
              <Text className="text-lg text-wrap ml-2 text-textSecondary">
                {item.title}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default streak;
