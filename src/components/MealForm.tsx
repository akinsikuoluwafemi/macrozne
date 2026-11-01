import { useMealForm } from "@/hooks/useMealForm";
import type { MealInput } from "@/storage/meals";
import { colors } from "@/styles/global";
import type { MealFormValues } from "@/utils/validation";
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

type MealFormProps = {
  initialValues?: MealFormValues;
  submitLabel: string;
  // Return true to clear the form after a successful submit (add flow).
  onSubmit: (data: MealInput) => Promise<boolean | void>;
};

// The one form used for both creating and editing a meal.
export default function MealForm({
  initialValues,
  submitLabel,
  onSubmit,
}: MealFormProps) {
  const { values, errors, isSubmitting, setField, reset, handleSubmit } =
    useMealForm(initialValues);

  const submit = handleSubmit(async (data) => {
    const shouldReset = await onSubmit(data);
    if (shouldReset) reset();
  });

  return (
    <View>
      <Field
        label="Meal name"
        value={values.name}
        onChangeText={setField("name")}
        error={errors.name}
      />
      <Field
        label="Calories"
        keyboardType="decimal-pad"
        value={values.calories}
        onChangeText={setField("calories")}
        error={errors.calories}
      />
      <View style={styles.row}>
        <Field
          label="Protein (g)"
          keyboardType="decimal-pad"
          value={values.protein}
          onChangeText={setField("protein")}
          error={errors.protein}
          style={styles.rowField}
        />
        <Field
          label="Carbs (g)"
          keyboardType="decimal-pad"
          value={values.carbs}
          onChangeText={setField("carbs")}
          error={errors.carbs}
          style={styles.rowField}
        />
        <Field
          label="Fat (g)"
          keyboardType="decimal-pad"
          value={values.fat}
          onChangeText={setField("fat")}
          error={errors.fat}
          style={styles.rowField}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={submit}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
      >
        <Text style={styles.buttonText}>{submitLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

type FieldProps = Omit<TextInputProps, "style"> & {
  label: string;
  error?: string;
  style?: TextInputProps["style"];
};

function Field({ label, error, style, ...inputProps }: FieldProps) {
  return (
    <View style={style}>
      {/* Visible label: placeholders vanish once a value is entered. */}
      <Text style={styles.label} importantForAccessibility="no">
        {label}
      </Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        accessibilityLabel={label}
        accessibilityHint={error}
        {...inputProps}
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: colors.alert,
  },
  error: {
    color: colors.alert,
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  rowField: {
    flex: 1,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
});
