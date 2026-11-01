import { useMealForm } from "@/hooks/useMealForm";
import { colors } from "@/styles/global";
import type { Meal } from "@/types/meal";
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
  // Omit to create a new meal; pass to edit an existing one.
  mealId?: string;
  initialValues?: MealFormValues;
  submitLabel: string;
  onSuccess?: (meals: Meal[]) => void;
};

// The one form used for both creating and editing a meal. Inputs are
// uncontrolled; the form is "submitted" to a server action.
export default function MealForm({
  mealId,
  initialValues,
  submitLabel,
  onSuccess,
}: MealFormProps) {
  const { defaultValues, errors, version, isPending, setField, submit } =
    useMealForm({ mealId, initialValues, onSuccess });

  return (
    // A new key after each successful save remounts the inputs, clearing them.
    <View key={version}>
      <Field
        label="Meal name"
        defaultValue={defaultValues.name}
        onChangeText={setField("name")}
        error={errors.name}
      />
      <Field
        label="Calories"
        keyboardType="decimal-pad"
        defaultValue={defaultValues.calories}
        onChangeText={setField("calories")}
        error={errors.calories}
      />
      <View style={styles.row}>
        <Field
          label="Protein (g)"
          keyboardType="decimal-pad"
          defaultValue={defaultValues.protein}
          onChangeText={setField("protein")}
          error={errors.protein}
          style={styles.rowField}
        />
        <Field
          label="Carbs (g)"
          keyboardType="decimal-pad"
          defaultValue={defaultValues.carbs}
          onChangeText={setField("carbs")}
          error={errors.carbs}
          style={styles.rowField}
        />
        <Field
          label="Fat (g)"
          keyboardType="decimal-pad"
          defaultValue={defaultValues.fat}
          onChangeText={setField("fat")}
          error={errors.fat}
          style={styles.rowField}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, isPending && styles.buttonDisabled]}
        onPress={submit}
        disabled={isPending}
        accessibilityRole="button"
        accessibilityState={{ disabled: isPending, busy: isPending }}
      >
        <Text style={styles.buttonText}>
          {isPending ? "Saving…" : submitLabel}
        </Text>
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
