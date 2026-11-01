import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Meal } from "@/storage/meals";
import { colors } from "@/styles/global";
import { formatSummary } from "@/utils/macros";

type CopyButtonProps = {
  todaysMeals: Meal[];
};

export default function CopyButton({ todaysMeals }: CopyButtonProps) {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(formatSummary(todaysMeals));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Copied!", "Macro summary copied to clipboard.");
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleCopy}
      accessibilityRole="button"
    >
      <Ionicons name="copy-outline" size={18} color={colors.primary} />
      <Text style={styles.text}>Copy Summary</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  text: {
    color: colors.primary,
    fontSize: 14,
  },
});
