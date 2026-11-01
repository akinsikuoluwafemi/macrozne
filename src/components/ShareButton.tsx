import { Ionicons } from "@expo/vector-icons";
import { Share, TouchableOpacity } from "react-native";
import { Meal } from "@/storage/meals";
import { colors } from "@/styles/global";
import { formatSummary } from "@/utils/macros";

type ShareButtonProps = {
  todaysMeals: Meal[];
};

export default function ShareButton({ todaysMeals }: ShareButtonProps) {
  const handleShare = async () => {
    await Share.share({ message: formatSummary(todaysMeals) });
  };

  return (
    <TouchableOpacity
      onPress={handleShare}
      accessibilityRole="button"
      accessibilityLabel="Share today's summary"
      hitSlop={8}
    >
      <Ionicons name="share-outline" size={24} color={colors.primary} />
    </TouchableOpacity>
  );
}
