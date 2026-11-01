import CopyButton from "@/components/CopyButton";
import HomeHeader from "@/components/HomeHeader";
import MacroGrid from "@/components/MacroGrid";
import RecentMeals from "@/components/RecentMeals";
import ReminderToggle from "@/components/ReminderToggle";
import Screen from "@/components/Screen";
import ShareButton from "@/components/ShareButton";
import { getMeals, Meal } from "@/storage/meals";
import { globalStyles } from "@/styles/global";
import { getTodaysMeals } from "@/utils/macros";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";

export default function HomeScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const todaysMeals = getTodaysMeals(meals);

  const loadMeals = async () => {
    setMeals(await getMeals());
  };

  useFocusEffect(
    useCallback(() => {
      void loadMeals();
    }, []),
  );

  return (
    <Screen>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>MacroZone</Text>
        <ShareButton todaysMeals={todaysMeals} />
      </View>
      <HomeHeader />
      <MacroGrid todaysMeals={todaysMeals} />
      <CopyButton todaysMeals={todaysMeals} />
      <ReminderToggle />
      <RecentMeals meals={meals} onDelete={loadMeals} />
    </Screen>
  );
}
