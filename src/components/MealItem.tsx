import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { deleteMeal, Meal } from "@/storage/meals";
import { colors } from "@/styles/global";
import * as Haptics from "expo-haptics";

type MealItemProps = {
  meal: Meal;
  onDelete: () => Promise<void>;
};

export default function MealItem({ meal, onDelete }: MealItemProps) {
  const { id, name, calories, protein, carbs, fat } = meal;

  const confirmDelete = () => {
    Alert.alert("Delete Meal", `Are you sure you want to delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteMeal(id);
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
          await onDelete();
        },
      },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onLongPress={confirmDelete}
      accessibilityHint="Long press to delete"
      accessibilityActions={[{ name: "delete", label: "Delete meal" }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === "delete") confirmDelete();
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
