import * as actions from "@/actions/meals";
import { colors } from "@/styles/global";
import type { Meal } from "@/types/meal";
import {
  createContext,
  type ReactNode,
  startTransition,
  Suspense,
  use,
  useActionState,
  useOptimistic,
} from "react";
import { ActivityIndicator, Alert, View } from "react-native";

export type MealsAction =
  | { type: "sync"; meals: Meal[] }
  | { type: "delete"; id: string }
  | { type: "clear" };

export type MealsContextValue = {
  meals: Meal[];
  isPending: boolean;
  // Replace the list with the server's copy after a form action succeeds.
  syncMeals: (meals: Meal[]) => void;
  deleteMeal: (id: string) => void;
  clearAllMeals: () => void;
};

export const MealsContext = createContext<MealsContextValue | null>(null);

// The list lives in useActionState: every change is an action that calls the
// server and returns the server's list as the new state. No useState.
async function mealsAction(
  current: Meal[],
  action: MealsAction,
): Promise<Meal[]> {
  try {
    switch (action.type) {
      case "sync":
        return action.meals;
      case "delete":
        return await actions.deleteMeal(action.id);
      case "clear":
        return await actions.clearAllMeals();
    }
  } catch (error) {
    // Returning the previous state also rolls back the optimistic update.
    console.error("Meals action failed", error);
    Alert.alert("Something went wrong", "Your change wasn't saved. Try again.");
    return current;
  }
}

// What the UI shows while an action is in flight.
function applyOptimistic(meals: Meal[], action: MealsAction): Meal[] {
  switch (action.type) {
    case "sync":
      return action.meals;
    case "delete":
      return meals.filter((meal) => meal.id !== action.id);
    case "clear":
      return [];
  }
}

// Fetch once per app session; `use()` suspends until it resolves.
let initialMealsPromise: Promise<Meal[]> | null = null;
const loadInitialMeals = () => (initialMealsPromise ??= actions.getMeals());

function MealsStore({ children }: { children: ReactNode }) {
  const initialMeals = use(loadInitialMeals());
  const [meals, dispatch, isPending] = useActionState(
    mealsAction,
    initialMeals,
  );
  const [optimisticMeals, setOptimistic] = useOptimistic(
    meals,
    applyOptimistic,
  );

  const run = (action: MealsAction) =>
    startTransition(() => {
      setOptimistic(action);
      dispatch(action);
    });

  return (
    <MealsContext.Provider
      value={{
        meals: optimisticMeals,
        isPending,
        syncMeals: (next) => run({ type: "sync", meals: next }),
        deleteMeal: (id) => run({ type: "delete", id }),
        clearAllMeals: () => run({ type: "clear" }),
      }}
    >
      {children}
    </MealsContext.Provider>
  );
}

export function MealsProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: colors.background,
          }}
        >
          <ActivityIndicator color={colors.primary} />
        </View>
      }
    >
      <MealsStore>{children}</MealsStore>
    </Suspense>
  );
}
