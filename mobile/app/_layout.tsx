import { Stack, Tabs } from "expo-router";
import './global.css'
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {

  return <SafeAreaProvider>
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="index" redirect />
      </Stack>
      <StatusBar style="dark" />
  </SafeAreaProvider>
}
