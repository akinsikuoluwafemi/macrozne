import {
  cancelMealReminders,
  requestPermissions,
  scheduleMealReminders,
} from "@/utils/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { startTransition, use, useActionState, useOptimistic } from "react";
import { Alert, Linking } from "react-native";

const REMINDERS_KEY = "remindersEnabled";

// A device preference, so it stays in AsyncStorage rather than on the server.
let savedPreference: Promise<boolean> | null = null;
const loadPreference = () =>
  (savedPreference ??= AsyncStorage.getItem(REMINDERS_KEY).then(
    (value) => value === "true",
  ));

async function setRemindersAction(
  current: boolean,
  next: boolean,
): Promise<boolean> {
  if (next) {
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
      return current;
    }
    await scheduleMealReminders();
  } else {
    await cancelMealReminders();
  }
  await AsyncStorage.setItem(REMINDERS_KEY, next.toString());
  return next;
}

// Must render inside <Suspense>: `use()` waits for the saved preference.
export function useReminders() {
  const [enabled, dispatch, isPending] = useActionState(
    setRemindersAction,
    use(loadPreference()),
  );
  // The switch flips immediately and snaps back if permission is denied.
  const [optimisticEnabled, setOptimisticEnabled] = useOptimistic(enabled);

  const setReminders = (next: boolean) =>
    startTransition(() => {
      setOptimisticEnabled(next);
      dispatch(next);
    });

  return { enabled: optimisticEnabled, isPending, setReminders };
}
