import type { Meal } from "@/types/meal";

export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const getTodaysMeals = (meals: Meal[], now = new Date()): Meal[] =>
  meals.filter((meal) => isSameDay(new Date(meal.createdAt), now));

export const getTotals = (meals: Meal[]): MacroTotals =>
  meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

export const formatSummary = (todaysMeals: Meal[]): string => {
  const totals = getTotals(todaysMeals);
  return `MacroZone Daily Summary\n\nCalories: ${totals.calories}\nProtein: ${totals.protein}g\nCarbs: ${totals.carbs}g\nFat: ${totals.fat}g\n\nMeals: ${todaysMeals.length} logged today`;
};

// Accepts "12", "12.5" and "12,5" (comma decimals from European keyboards).
// Returns null for anything that isn't a finite, non-negative number.
export const parseAmount = (text: string): number | null => {
  const trimmed = text.trim().replace(",", ".");
  if (trimmed === "") return null;
  const value = Number(trimmed);
  return Number.isFinite(value) && value >= 0 ? value : null;
};
