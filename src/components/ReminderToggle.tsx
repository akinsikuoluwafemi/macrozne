import { useReminders } from "@/hooks/useReminders";
import { colors } from "@/styles/global";
import { Suspense } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

export default function ReminderToggle() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Meal Reminders</Text>
      <Suspense fallback={<Switch value={false} disabled />}>
        <ReminderSwitch />
      </Suspense>
    </View>
  );
}

function ReminderSwitch() {
  const { enabled, isPending, setReminders } = useReminders();

  return (
    <Switch
      value={enabled}
      onValueChange={setReminders}
      disabled={isPending}
      accessibilityLabel="Meal reminders"
      trackColor={{ false: colors.surface, true: colors.primary }}
    />
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
