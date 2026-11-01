import MealForm from "@/components/MealForm";
import Screen from "@/components/Screen";
import { globalStyles } from "@/styles/global";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Text } from "react-native";

export default function AddMealScreen() {
  return (
    <Screen>
      <Text style={globalStyles.title}>Add Meal</Text>
      <MealForm
        submitLabel="Add Meal"
        onSuccess={() => {
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
          router.navigate("/");
        }}
      />
    </Screen>
  );
}
