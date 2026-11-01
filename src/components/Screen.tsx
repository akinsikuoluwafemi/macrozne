import type { ReactNode } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { globalStyles } from "@/styles/global";

type ScreenProps = {
  children: ReactNode;
};

// Scrollable screen container that keeps content clear of the status bar,
// notch and Dynamic Island on every device.
export default function Screen({ children }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={[
        globalStyles.content,
        { paddingTop: insets.top + 16 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}
