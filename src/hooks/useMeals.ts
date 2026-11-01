import { MealsContext } from "@/context/MealsContext";
import { getTodaysMeals, getTotals } from "@/utils/macros";
import { useContext } from "react";

export function useMeals() {
  const context = useContext(MealsContext);
  if (!context) {
    throw new Error("useMeals must be used inside <MealsProvider>");
  }

  const todaysMeals = getTodaysMeals(context.meals);

  return {
    ...context,
    todaysMeals,
    todaysTotals: getTotals(todaysMeals),
  };
}

export function useMeal(id: string) {
  const { meals } = useMeals();
  return meals.find((meal) => meal.id === id);
}
