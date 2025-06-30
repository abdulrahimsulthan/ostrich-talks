import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity, View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import userStore from "@/store/userStore";
import overviewStore from "@/store/overviewStore";
import { completedMessage, streakLevels } from "@/constants/streak";
import HomeMenus from "@/components/Home/HomeMenus";

export default function Index() {
  const { name } = userStore();
  const streakLevel = overviewStore((state) => state.streakLevel);
  const { title, message } =
    streakLevel < streakLevels.length
      ? streakLevels[streakLevel]
      : completedMessage;

  return (
    <SafeAreaView className="bg-background">
      <View className="flex-row w-full py-4 justify-around">
        <HomeMenus />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-1 items-center  bg-background h-screen-safe">
          {/* TODO: Motivative banner */}
          <View
            className={`
              w-[90%] h-24 bg-primary rounded-md flex-row 
              items-center justify-between py-2
            `}
          >
            {/* Message */}
            <View className={`pl-4 w-[80%] gap-1`}>
              <Text
                className={`
                text-white text-lg font-semibold
              `}
              >
                {title}
              </Text>
              <Text className="text-white">{message}</Text>
            </View>
            <MaterialIcons
              className={`w-[20%] text-center`}
              name="whatshot"
              size={40}
              color="white"
            />
          </View>

          {/* TODO: Lession Content */}
          <View className="flex-1 items-center justify-center w-full px-4">
            <Text className="text-textPrimary">
              Welcome {name} to Ostrich Talks!
            </Text>
            <Text className="text-textSecondary">
              This is where you can find your lessons.
            </Text>
            <Text className="text-textSecondary">
              Click on the buttons below to mock levels.
            </Text>

            <View className="w-full flex-row justify-around items-center mt-4">
              <TouchableOpacity>
                <Text
                  className={`
                text-white bg-primary border 
                border-border rounded-md px-4 py-2 
                `}
                >
                  Start Lession
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-white bg-primary rounded-md px-4 py-2">
                  End Lession
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
