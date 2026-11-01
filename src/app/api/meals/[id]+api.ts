import { readMeals, writeMeals } from "@/server/mealsStore";
import { type MealFormValues, validateMealForm } from "@/utils/validation";

type Params = { id: string };

// PUT /api/meals/:id → update.
export async function PUT(request: Request, { id }: Params) {
  const result = validateMealForm((await request.json()) as MealFormValues);
  if (!result.ok) {
    return Response.json({ errors: result.errors }, { status: 422 });
  }

  const meals = await readMeals();
  if (!meals.some((meal) => meal.id === id)) {
    return Response.json(
      { errors: { name: "This meal no longer exists" } },
      { status: 404 },
    );
  }

  const updated = await writeMeals(
    meals.map((meal) => (meal.id === id ? { ...meal, ...result.data } : meal)),
  );
  return Response.json({ meals: updated });
}

// DELETE /api/meals/:id → delete one.
export async function DELETE(_request: Request, { id }: Params) {
  const meals = await readMeals();
  return Response.json({
    meals: await writeMeals(meals.filter((meal) => meal.id !== id)),
  });
}
