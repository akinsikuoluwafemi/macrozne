import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Alert, Linking, StyleSheet, Switch, Text, View } from "react-native";
import { colors } from "@/styles/global";
import {
  cancelMealReminders,
  requestPermissions,
  scheduleMealReminders,
} from "@/utils/notifications";

const REMINDERS_KEY = "remindersEnabled";

export default function ReminderToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const load = async () => {
      const val = await AsyncStorage.getItem(REMINDERS_KEY);
      setEnabled(val === "true");
    };
    void load();
  }, []);

  const toggle = async (value: boolean) => {
    if (value) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          "Notifications are off",
          "Allow notifications for MacroZone in Settings to get meal reminders.",
          [
            { text: "Not now", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => void Linking.openSettings(),
            },
          ],
        );
        return;
      }
      await scheduleMealReminders();
    } else {
      await cancelMealReminders();
    }
    setEnabled(value);
    await AsyncStorage.setItem(REMINDERS_KEY, value.toString());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Meal Reminders</Text>
      <Switch
        value={enabled}
        onValueChange={toggle}
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
