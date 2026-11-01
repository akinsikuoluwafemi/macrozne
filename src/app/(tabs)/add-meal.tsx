import Screen from "@/components/Screen";
import { addMeal } from "@/storage/meals";
import { colors, globalStyles } from "@/styles/global";
import { parseAmount } from "@/utils/macros";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddMealScreen() {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const handleAddMeal = async () => {
    const parsedCalories = parseAmount(calories);
    // Optional fields: empty means 0, anything else must be a valid number.
    const parsedMacros = [protein, carbs, fat].map((value) =>
      value.trim() === "" ? 0 : parseAmount(value),
    );

    if (!name.trim() || parsedCalories === null) {
      Alert.alert(
        "Error",
        "Please enter a meal name and a valid calorie amount.",
      );
      return;
    }
    if (parsedMacros.includes(null)) {
      Alert.alert("Error", "Protein, carbs and fat must be numbers.");
      return;
    }

    const [parsedProtein, parsedCarbs, parsedFat] = parsedMacros as number[];
    await addMeal({
      name: name.trim(),
      calories: parsedCalories,
      protein: parsedProtein,
      carbs: parsedCarbs,
      fat: parsedFat,
    });

    setName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.navigate("/");
  };

  return (
    <Screen>
      <Text style={globalStyles.title}>Add Meal</Text>

      <TextInput
        style={styles.input}
        placeholder="Meal name"
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel="Meal name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Calories"
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel="Calories"
        keyboardType="decimal-pad"
        value={calories}
        onChangeText={setCalories}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="Protein (g)"
          placeholderTextColor={colors.textSecondary}
          accessibilityLabel="Protein in grams"
          keyboardType="decimal-pad"
          value={protein}
          onChangeText={setProtein}
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="Carbs (g)"
          placeholderTextColor={colors.textSecondary}
          accessibilityLabel="Carbs in grams"
          keyboardType="decimal-pad"
          value={carbs}
          onChangeText={setCarbs}
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="Fat (g)"
          placeholderTextColor={colors.textSecondary}
          accessibilityLabel="Fat in grams"
          keyboardType="decimal-pad"
          value={fat}
          onChangeText={setFat}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleAddMeal}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Add Meal</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    marginTop: 16,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  rowInput: {
    flex: 1,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
});
