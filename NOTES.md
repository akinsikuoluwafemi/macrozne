# MacroZone: `feature/crud-hooks`

Builds on `fix/review-issues`. Adds **full CRUD**: create, read, **update (new)** and delete.
It also removes the duplicated data-loading and form logic by moving it into **custom hooks**
and **one context provider**. Compare with `git diff fix/review-issues..feature/crud-hooks`.

## Branch map

| Branch | Built from | What it shows |
|---|---|---|
| `main` | n/a | Baseline app, unreviewed. Its NOTES.md is the code review |
| `fix/review-issues` | `main` | Review findings fixed, minimal changes |
| `feature/crud-hooks` | `fix/review-issues` | Full CRUD + hooks + context (this branch) |
| `feature/server-actions` | `feature/crud-hooks` | Data on the server via Expo Server Functions, React 19 actions, no `useState` |

## The problem this branch solves

On `fix/review-issues`, *every* screen did this:

```tsx
const [meals, setMeals] = useState<Meal[]>([]);
const loadMeals = async () => setMeals(await getMeals());
useFocusEffect(useCallback(() => { void loadMeals(); }, []));
```

That meant three copies of the same state, a re-read from disk on every tab switch, and an
`onDelete` callback threaded through `RecentMeals → MealItem` just so the parent could reload.
Adding *edit* would have added a fourth copy.

## Architecture now

```
MealsProvider (context)           ← the one copy of meals[] in memory
  ├─ useMeals()                   ← read meals, todaysMeals, todaysTotals + mutations
  ├─ useMeal(id)                  ← one meal by id (edit screen)
  ├─ useConfirmDelete()           ← confirm → delete → haptic, used by row + edit screen
  ├─ useMealForm(initialValues)   ← field state, validation, isSubmitting (add + edit)
  └─ useReminders()               ← notification permission + toggle state
```

| File | Role |
|---|---|
| `src/context/MealsContext.tsx` | Loads once on app start. Mutations write storage **then** update memory, so all screens re-render instantly |
| `src/hooks/useMeals.ts` | Throws if used outside the provider: fail loudly, not with `undefined` |
| `src/hooks/useMealForm.ts` | Strings in, validated `MealInput` out; per-field errors; blocks double-submit |
| `src/utils/validation.ts` | **Pure** `validateMealForm()`: no React, unit-testable, reusable on a server (see next branch) |
| `src/components/MealForm.tsx` | The single form for add *and* edit, with inline errors instead of `Alert`s |
| `src/app/meal/[id].tsx` | **New** edit screen, presented as a modal; also has Delete |
| `src/storage/meals.ts` | Added `updateMeal()` and a `MealInput` type |

### CRUD map

| Operation | UI | Hook / function |
|---|---|---|
| Create | Add Meal tab → `MealForm` | `useMeals().addMeal` |
| Read | Home (today + recent 5), All Meals tab | `useMeals()` |
| Update | Tap any meal → Edit modal → `MealForm` | `useMeals().updateMeal` |
| Delete | Long-press row, VoiceOver action, or Edit → "Delete Meal" | `useConfirmDelete()` |
| Delete all | All Meals → Clear All | `useConfirmDelete().confirmClearAll` |

## Decisions worth explaining

- **Context, not Redux/Zustand/React Query.** One small, local list with no server: context
  is enough. I'd reach for React Query the moment meals come from an API (caching,
  retries, background refetch), and Zustand if many unrelated parts of the tree subscribed
  to slices of state (context re-renders every consumer on any change).
- **Write-through, not optimistic.** Storage is written first, then state. If the write
  fails, the UI never shows data that isn't saved. With a slow network API you'd flip this to
  optimistic + rollback (see the next branch's `useOptimistic`).
- **No `useCallback`/`useMemo` in the provider.** `app.json` enables the **React Compiler**,
  which memoizes components and values automatically. Adding them manually is noise. Worth
  saying in an interview: you know the tool and you know when it's *not* needed.
- **Validation is a pure function outside the hook.** The hook manages *state*; the pure
  function owns *rules*. Rules can then be tested without rendering, and shared with a server.
- **Inline field errors > `Alert`.** Errors sit next to the field, `accessibilityLiveRegion`
  announces them, the border turns red, and the user doesn't lose context.
- **Visible labels above inputs.** Placeholders disappear once there's a value (the edit form
  showed "10 / 10 / 25" with no clue which was which). Placeholder-as-label is a known a11y
  anti-pattern.
- **Edit is a route (`/meal/[id]`), not local modal state.** It's deep-linkable
  (`macrozone://meal/123`), the back gesture works, and the screen handles "meal no longer
  exists" for stale links.
- **`useConfirmDelete` owns the confirm flow.** Two entry points (row and edit screen) now
  share one implementation, so the copy, haptics and safety behave identically.

## Trade-offs / what I'd do next

- `JSON.parse(...) as Meal[]` still has no runtime schema validation (Zod).
- AsyncStorage rewrites the whole array on every change: fine for hundreds of meals, not
  tens of thousands. Next step: SQLite (`expo-sqlite`) with an index on `createdAt`.
- Lists use `.map()` inside a `ScrollView`. Switch All Meals to `FlatList`/`FlashList` once
  lists get long (virtualisation).
- Tests: `validation.ts` and `macros.ts` are pure and ready for Jest; hooks via
  `@testing-library/react-native`'s `renderHook`.

## Interview angle

"Why hooks?" is really "why separate *what* from *how*". Screens now read like a description
of the UI; the hooks hide storage, validation and side effects. If the data source changes
(AsyncStorage → API → server functions), only the provider changes, and the screens don't.
The next branch proves this.
