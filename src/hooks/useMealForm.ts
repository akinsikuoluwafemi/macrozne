import { saveMeal } from "@/actions/meals";
import type { Meal } from "@/types/meal";
import {
  emptyMealForm,
  type MealFormErrors,
  type MealFormValues,
} from "@/utils/validation";
import { startTransition, useActionState, useRef } from "react";
import { useMeals } from "./useMeals";

export type MealFormState = {
  errors: MealFormErrors;
  // Bumped on every successful save; used as a `key` to reset the inputs.
  version: number;
};

type UseMealFormOptions = {
  mealId?: string;
  initialValues?: MealFormValues;
  onSuccess?: (meals: Meal[]) => void;
};

// Form state without useState: inputs are uncontrolled (values live in a ref,
// like a native <form>), and submitting runs a server action through
// useActionState, which gives us the errors and pending flag.
export function useMealForm({
  mealId,
  initialValues = emptyMealForm,
  onSuccess,
}: UseMealFormOptions = {}) {
  const { syncMeals } = useMeals();
  const values = useRef<MealFormValues>({ ...initialValues });

  const [state, submitAction, isPending] = useActionState(
    async (prev: MealFormState): Promise<MealFormState> => {
      try {
        const result = await saveMeal({ ...values.current }, mealId);
        if (!result.ok) return { ...prev, errors: result.errors };

        syncMeals(result.meals);
        onSuccess?.(result.meals);
        if (!mealId) values.current = { ...initialValues };
        return { errors: {}, version: prev.version + 1 };
      } catch {
        return { ...prev, errors: { name: "Couldn't reach the server" } };
      }
    },
    { errors: {}, version: 0 },
  );

  const setField = (field: keyof MealFormValues) => (text: string) => {
    values.current[field] = text;
  };

  const submit = () => {
    if (isPending) return;
    startTransition(() => submitAction());
  };

  return {
    defaultValues: initialValues,
    errors: state.errors,
    version: state.version,
    isPending,
    setField,
    submit,
  };
}
