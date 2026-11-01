import { readMeals, writeMeals } from "@/server/mealsStore";
import type { Meal } from "@/types/meal";
import { type MealFormValues, validateMealForm } from "@/utils/validation";

// GET /api/meals → all meals, newest first.
export async function GET() {
  return Response.json({ meals: await readMeals() });
}

// POST /api/meals → create. Validation runs here, on the server, so the rules
// can't be bypassed by a modified client.
export async function POST(request: Request) {
  const result = validateMealForm((await request.json()) as MealFormValues);
  if (!result.ok) {
    return Response.json({ errors: result.errors }, { status: 422 });
  }

  const meal: Meal = {
    ...result.data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  const meals = await writeMeals([meal, ...(await readMeals())]);
  return Response.json({ meals }, { status: 201 });
}

// DELETE /api/meals → clear all.
export async function DELETE() {
  return Response.json({ meals: await writeMeals([]) });
}
