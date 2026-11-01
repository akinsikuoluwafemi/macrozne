import { MealsProvider } from "@/context/MealsContext";
import { colors } from "@/styles/global";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <MealsProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="meal/[id]"
          options={{
            headerShown: true,
            presentation: "modal",
            title: "Edit Meal",
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: colors.text,
          }}
        />
      </Stack>
    </MealsProvider>
  );
}
