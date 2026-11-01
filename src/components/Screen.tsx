import type { ReactNode } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { globalStyles } from "@/styles/global";

type ScreenProps = {
  children: ReactNode;
  // Screens with a native header let iOS inset the content below the header;
  // screens without one pad for the status bar / Dynamic Island themselves.
  hasHeader?: boolean;
};

// Scrollable screen container that keeps content clear of the status bar,
// notch and Dynamic Island on every device.
export default function Screen({ children, hasHeader = false }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={[
        globalStyles.content,
        { paddingTop: hasHeader ? 16 : insets.top + 16 },
      ]}
      contentInsetAdjustmentBehavior={hasHeader ? "automatic" : "never"}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}
