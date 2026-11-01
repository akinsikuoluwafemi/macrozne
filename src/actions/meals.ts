// Client-side "server actions": async functions the UI calls to change data on
// the server. Each one maps to an API route in src/app/api and resolves with
// the server's copy of the list, so the server stays the source of truth.
//
// Relative URLs resolve to the Expo dev server in development; production
// native builds need `origin` set on the expo-router plugin in app.json.

import type { Meal } from "@/types/meal";
import type { MealFormErrors, MealFormValues } from "@/utils/validation";

export type SaveMealResult =
  { ok: true; meals: Meal[] } | { ok: false; errors: MealFormErrors };

type MealsResponse = { meals: Meal[] };
type ErrorsResponse = { errors: MealFormErrors };

async function send<T>(url: string, method = "GET", body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { response, data: (await response.json()) as T };
}

async function mutate(url: string, method: string): Promise<Meal[]> {
  const { response, data } = await send<MealsResponse>(url, method);
  if (!response.ok) throw new Error(`${method} ${url} failed`);
  return data.meals;
}

export const getMeals = () => mutate("/api/meals", "GET");

// Create when `id` is omitted, update otherwise.
export async function saveMeal(
  values: MealFormValues,
  id?: string,
): Promise<SaveMealResult> {
  const { response, data } = await send<MealsResponse | ErrorsResponse>(
    id ? `/api/meals/${id}` : "/api/meals",
    id ? "PUT" : "POST",
    values,
  );
  if ("errors" in data) return { ok: false, errors: data.errors };
  if (!response.ok) throw new Error("Saving the meal failed");
  return { ok: true, meals: data.meals };
}

export const deleteMeal = (id: string) => mutate(`/api/meals/${id}`, "DELETE");

export const clearAllMeals = () => mutate("/api/meals", "DELETE");
