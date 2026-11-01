import AsyncStorage from "@react-native-async-storage/async-storage";

export type Meal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
};

export type MealInput = Omit<Meal, "id" | "createdAt">;

const MEALS_KEY = "meals";

const saveMeals = (meals: Meal[]) =>
  AsyncStorage.setItem(MEALS_KEY, JSON.stringify(meals));

export const getMeals = async (): Promise<Meal[]> => {
  const data = await AsyncStorage.getItem(MEALS_KEY);
  return data ? (JSON.parse(data) as Meal[]) : [];
};

export const addMeal = async (input: MealInput): Promise<Meal> => {
  const meals = await getMeals();
  const newMeal: Meal = {
    ...input,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  await saveMeals([newMeal, ...meals]);
  return newMeal;
};

export const updateMeal = async (
  id: string,
  input: MealInput,
): Promise<Meal> => {
  const meals = await getMeals();
  const existing = meals.find((meal) => meal.id === id);
  if (!existing) throw new Error(`Meal ${id} not found`);

  const updated: Meal = { ...existing, ...input };
  await saveMeals(meals.map((meal) => (meal.id === id ? updated : meal)));
  return updated;
};

export const deleteMeal = async (id: string): Promise<void> => {
  const meals = await getMeals();
  await saveMeals(meals.filter((meal) => meal.id !== id));
};

export const clearAllMeals = async (): Promise<void> => {
  await AsyncStorage.removeItem(MEALS_KEY);
};
