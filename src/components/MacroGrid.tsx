import { StyleSheet, View } from "react-native";
import { Meal } from "@/types/meal";
import { getTotals } from "@/utils/macros";
import MacroCard from "./MacroCard";

type MacroGridProps = {
  todaysMeals: Meal[];
};

export default function MacroGrid({ todaysMeals }: MacroGridProps) {
  const totals = getTotals(todaysMeals);

  return (
    <View style={styles.grid}>
      <MacroCard
        label="Calories"
        value={`${totals.calories}`}
        goal="2,000"
        color="#ff6b6b"
      />
      <MacroCard
        label="Protein"
        value={`${totals.protein}g`}
        goal="150g"
        color="#4ecdc4"
      />
      <MacroCard
        label="Carbs"
        value={`${totals.carbs}g`}
        goal="250g"
        color="#ffd93d"
      />
      <MacroCard
        label="Fat"
        value={`${totals.fat}g`}
        goal="65g"
        color="#6bcb77"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
});
