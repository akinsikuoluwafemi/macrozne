import MealForm from "@/components/MealForm";
import Screen from "@/components/Screen";
import { useMeals } from "@/hooks/useMeals";
import { globalStyles } from "@/styles/global";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Text } from "react-native";

export default function AddMealScreen() {
  const { addMeal } = useMeals();

  return (
    <Screen>
      <Text style={globalStyles.title}>Add Meal</Text>
      <MealForm
        submitLabel="Add Meal"
        onSubmit={async (data) => {
          await addMeal(data);
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
          router.navigate("/");
          return true;
        }}
      />
    </Screen>
  );
}
