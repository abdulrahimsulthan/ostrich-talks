import colors from "@/constants/colors";
import overviewStore from "@/store/overviewStore";
import { MaterialIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Text, View } from "react-native";
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { useEffect } from "react";

export default function HomeLayout() {
    const handleAuthStateChanged = (user: any) => {
        console.log("authstate",user)
        if (!user) router.replace('/login')
    };

    useEffect(() => {
        const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);

    const {feathers} = overviewStore()
    const shopRight = () =>
        <View className="flex-row items-center justify-center gap-2">
            <MaterialIcons name="monetization-on" size={24} color={colors.primary} />
            <Text className="text-textSecondary font-bold text-lg">{feathers}</Text>
        </View>


    return (
        <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="streak" options={{
                presentation: "fullScreenModal",
                title: "Streak",
            }} />
            <Stack.Screen name="shop" options={{
                presentation: "fullScreenModal",
                title: "Shop",
                headerRight: shopRight,
            }} />
            <Stack.Screen name="willpower" options={{
                presentation: "fullScreenModal",
                title: "Will Power",
            }} />
            <Stack.Screen name="plan" options={{
                presentation: "fullScreenModal",
                title: "Plan",
            }} />
            <Stack.Screen name="alterEgo" options={{
                presentation: "fullScreenModal",
                title: "Alter Egos",
            }} />
        </Stack>
    )
};
