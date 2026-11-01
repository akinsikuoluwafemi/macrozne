import { useReminders } from "@/hooks/useReminders";
import { colors } from "@/styles/global";
import { StyleSheet, Switch, Text, View } from "react-native";

export default function ReminderToggle() {
  const { enabled, setReminders } = useReminders();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Meal Reminders</Text>
      <Switch
        value={enabled}
        onValueChange={setReminders}
        accessibilityLabel="Meal reminders"
        trackColor={{ false: colors.surface, true: colors.primary }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
  },
  label: {
    color: colors.text,
    fontSize: 16,
  },
});
