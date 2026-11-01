import { StyleSheet, Text, View } from "react-native";
import { Meal } from "@/storage/meals";
import { globalStyles } from "@/styles/global";
import MealItem from "./MealItem";

type RecentMealsProps = {
  meals: Meal[];
  onDelete: () => Promise<void>;
};

export default function RecentMeals({ meals, onDelete }: RecentMealsProps) {
  return (
    <View style={styles.container}>
      <Text style={globalStyles.sectionTitle}>Recent Meals</Text>
      {meals.length === 0 ? (
        <Text style={globalStyles.empty}>No meals logged yet.</Text>
      ) : (
        meals
          .slice(0, 5)
          .map((meal) => (
            <MealItem key={meal.id} meal={meal} onDelete={onDelete} />
          ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
  },
});
