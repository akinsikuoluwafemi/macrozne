import MealForm from "@/components/MealForm";
import Screen from "@/components/Screen";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useMeal, useMeals } from "@/hooks/useMeals";
import { colors, globalStyles } from "@/styles/global";
import { toMealFormValues } from "@/utils/validation";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function EditMealScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const meal = useMeal(id);
  const { updateMeal } = useMeals();
  const { confirmDelete } = useConfirmDelete();

  if (!meal) {
    return (
      <Screen hasHeader>
        <Text style={globalStyles.empty}>This meal no longer exists.</Text>
      </Screen>
    );
  }

  return (
    <Screen hasHeader>
      <MealForm
        initialValues={toMealFormValues(meal)}
        submitLabel="Save Changes"
        onSubmit={async (data) => {
          await updateMeal(meal.id, data);
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
          router.back();
        }}
      />
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDelete(meal, () => router.back())}
        accessibilityRole="button"
      >
        <Text style={styles.deleteText}>Delete Meal</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  deleteText: {
    color: colors.alert,
    fontSize: 16,
  },
});
