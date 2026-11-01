import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import type { Meal } from "@/storage/meals";
import { colors } from "@/styles/global";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type MealItemProps = {
  meal: Meal;
};

export default function MealItem({ meal }: MealItemProps) {
  const { confirmDelete } = useConfirmDelete();
  const { name, calories, protein, carbs, fat } = meal;

  const openEditor = () => router.push(`/meal/${meal.id}`);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={openEditor}
      onLongPress={() => confirmDelete(meal)}
      accessibilityRole="button"
      accessibilityHint="Opens the meal to edit. Long press to delete."
      accessibilityActions={[
        { name: "activate", label: "Edit meal" },
        { name: "delete", label: "Delete meal" },
      ]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === "activate") openEditor();
        if (event.nativeEvent.actionName === "delete") confirmDelete(meal);
      }}
    >
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.macros}>
        {calories} cal • {protein}g P • {carbs}g C • {fat}g F
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  macros: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
