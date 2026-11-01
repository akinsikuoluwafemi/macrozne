import type { Meal, MealInput } from "@/types/meal";
import { parseAmount } from "./macros";

// Form fields are always strings; they're only converted to numbers on submit.
export type MealFormValues = {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

export type MealFormErrors = Partial<Record<keyof MealFormValues, string>>;

export type ValidationResult =
  { ok: true; data: MealInput } | { ok: false; errors: MealFormErrors };

export const emptyMealForm: MealFormValues = {
  name: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
};

export const toMealFormValues = (meal: Meal): MealFormValues => ({
  name: meal.name,
  calories: String(meal.calories),
  protein: String(meal.protein),
  carbs: String(meal.carbs),
  fat: String(meal.fat),
});

// Optional macro fields: empty means 0, anything else must be a valid number.
const parseOptional = (text: string) =>
  text.trim() === "" ? 0 : parseAmount(text);

export const validateMealForm = (values: MealFormValues): ValidationResult => {
  const errors: MealFormErrors = {};
  const name = values.name.trim();
  const calories = parseAmount(values.calories);
  const protein = parseOptional(values.protein);
  const carbs = parseOptional(values.carbs);
  const fat = parseOptional(values.fat);

  if (!name) errors.name = "Enter a meal name";
  if (calories === null) errors.calories = "Enter calories as a number";
  if (protein === null) errors.protein = "Must be a number";
  if (carbs === null) errors.carbs = "Must be a number";
  if (fat === null) errors.fat = "Must be a number";

  if (
    calories === null ||
    protein === null ||
    carbs === null ||
    fat === null ||
    !name
  ) {
    return { ok: false, errors };
  }

  return { ok: true, data: { name, calories, protein, carbs, fat } };
};
