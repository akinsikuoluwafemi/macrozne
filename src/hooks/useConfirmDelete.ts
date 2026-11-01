import type { Meal } from "@/types/meal";
import * as Haptics from "expo-haptics";
import { Alert } from "react-native";
import { useMeals } from "./useMeals";

// One confirm-then-delete flow for every place a meal can be deleted.
export function useConfirmDelete() {
  const { deleteMeal, clearAllMeals, meals } = useMeals();

  const confirmDelete = (meal: Meal, onDeleted?: () => void) => {
    Alert.alert(
      "Delete Meal",
      `Are you sure you want to delete "${meal.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Optimistic: the row disappears now; the server confirms later.
            deleteMeal(meal.id);
            void Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            );
            onDeleted?.();
          },
        },
      ],
    );
  };

  const confirmClearAll = () => {
    Alert.alert(
      "Clear all meals?",
      `This permanently deletes all ${meals.length} meals.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear All", style: "destructive", onPress: clearAllMeals },
      ],
    );
  };

  return { confirmDelete, confirmClearAll };
}
