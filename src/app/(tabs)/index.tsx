import CopyButton from "@/components/CopyButton";
import HomeHeader from "@/components/HomeHeader";
import MacroGrid from "@/components/MacroGrid";
import RecentMeals from "@/components/RecentMeals";
import ReminderToggle from "@/components/ReminderToggle";
import Screen from "@/components/Screen";
import ShareButton from "@/components/ShareButton";
import { useMeals } from "@/hooks/useMeals";
import { globalStyles } from "@/styles/global";
import { Text, View } from "react-native";

export default function HomeScreen() {
  const { meals, todaysMeals } = useMeals();

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
      <RecentMeals meals={meals} />
    </Screen>
  );
}
