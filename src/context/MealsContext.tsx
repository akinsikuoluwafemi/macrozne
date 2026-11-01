import * as storage from "@/storage/meals";
import type { Meal, MealInput } from "@/storage/meals";
import { createContext, type ReactNode, useEffect, useState } from "react";

export type MealsContextValue = {
  meals: Meal[];
  isLoading: boolean;
  addMeal: (input: MealInput) => Promise<Meal>;
  updateMeal: (id: string, input: MealInput) => Promise<Meal>;
  deleteMeal: (id: string) => Promise<void>;
  clearAllMeals: () => Promise<void>;
};

export const MealsContext = createContext<MealsContextValue | null>(null);

// Single source of truth for meals. Storage is written first, then the
// in-memory list is updated, so every screen re-renders without reloading.
// No useCallback/useMemo: the React Compiler (app.json) memoizes for us.
export function MealsProvider({ children }: { children: ReactNode }) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storage
      .getMeals()
      .then(setMeals)
      .catch((error: unknown) => console.error("Failed to load meals", error))
      .finally(() => setIsLoading(false));
  }, []);

  const addMeal = async (input: MealInput) => {
    const meal = await storage.addMeal(input);
    setMeals((current) => [meal, ...current]);
    return meal;
  };

  const updateMeal = async (id: string, input: MealInput) => {
    const meal = await storage.updateMeal(id, input);
    setMeals((current) => current.map((m) => (m.id === id ? meal : m)));
    return meal;
  };

  const deleteMeal = async (id: string) => {
    await storage.deleteMeal(id);
    setMeals((current) => current.filter((m) => m.id !== id));
  };

  const clearAllMeals = async () => {
    await storage.clearAllMeals();
    setMeals([]);
  };

  return (
    <MealsContext.Provider
      value={{
        meals,
        isLoading,
        addMeal,
        updateMeal,
        deleteMeal,
        clearAllMeals,
      }}
    >
      {children}
    </MealsContext.Provider>
  );
}
