import MealItem from "@/components/MealItem";
import Screen from "@/components/Screen";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useMeals } from "@/hooks/useMeals";
import { colors, globalStyles } from "@/styles/global";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AllMealsScreen() {
  const { meals, isLoading } = useMeals();
  const { confirmClearAll } = useConfirmDelete();

  return (
    <Screen>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>All Meals</Text>
        {meals.length > 0 && (
          <TouchableOpacity
            onPress={confirmClearAll}
            accessibilityRole="button"
          >
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.list}>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : meals.length === 0 ? (
          <Text style={globalStyles.empty}>No meals logged yet.</Text>
        ) : (
          meals.map((meal) => <MealItem key={meal.id} meal={meal} />)
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  clearButton: {
    color: colors.alert,
    fontSize: 16,
  },
  list: {
    marginTop: 30,
  },
});
