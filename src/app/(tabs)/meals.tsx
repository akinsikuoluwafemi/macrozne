import MealItem from "@/components/MealItem";
import Screen from "@/components/Screen";
import { clearAllMeals, getMeals, Meal } from "@/storage/meals";
import { colors, globalStyles } from "@/styles/global";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AllMealsScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);

  const loadMeals = async () => {
    setMeals(await getMeals());
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear all meals?",
      `This permanently deletes all ${meals.length} meals.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await clearAllMeals();
            await loadMeals();
          },
        },
      ],
    );
  };

  useFocusEffect(
    useCallback(() => {
      void loadMeals();
    }, []),
  );

  return (
    <Screen>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>All Meals</Text>
        {meals.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} accessibilityRole="button">
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.list}>
        {meals.length === 0 ? (
          <Text style={globalStyles.empty}>No meals logged yet.</Text>
        ) : (
          meals.map((meal) => (
            <MealItem key={meal.id} meal={meal} onDelete={loadMeals} />
          ))
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
