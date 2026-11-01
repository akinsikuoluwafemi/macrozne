import type { MealInput } from "@/storage/meals";
import {
  emptyMealForm,
  type MealFormErrors,
  type MealFormValues,
  validateMealForm,
} from "@/utils/validation";
import { useState } from "react";

// Shared state + validation for the add and edit forms.
export function useMealForm(initialValues: MealFormValues = emptyMealForm) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<MealFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (field: keyof MealFormValues) => (text: string) => {
    setValues((current) => ({ ...current, [field]: text }));
    // Clear a field's error as soon as the user edits it.
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  const handleSubmit =
    (onValid: (data: MealInput) => Promise<void>) => async () => {
      if (isSubmitting) return;

      const result = validateMealForm(values);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }

      setIsSubmitting(true);
      try {
        await onValid(result.data);
      } finally {
        setIsSubmitting(false);
      }
    };

  return { values, errors, isSubmitting, setField, reset, handleSubmit };
}
