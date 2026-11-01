# MacroZone: `main` (baseline)

This branch is the starting point: a small Expo / React Native meal and macro tracker,
written quickly and *not* yet reviewed. Treat it like a pull request you've been asked
to review in an interview. Before reading the review below, try to find the problems
yourself.

## Branch map

| Branch | Built from | What it shows |
|---|---|---|
| `main` | n/a | Baseline app, unreviewed (this branch) |
| `fix/review-issues` | `main` | Every review finding fixed with small, targeted changes |
| `feature/crud-hooks` | `fix/review-issues` | Full CRUD (incl. edit), custom hooks + context, shared form |
| `feature/server-actions` | `feature/crud-hooks` | Data on the server via Expo Server Functions, React 19 actions, no `useState` |

Compare any two with `git diff main..fix/review-issues` (or on GitHub with the *Compare* view).

## What the app does

- **Home tab**: today's date, a 2×2 macro grid (calories, protein, carbs, fat against fixed goals),
  share and copy-summary buttons, a daily-reminder toggle, the 5 most recent meals.
- **Add Meal tab**: a form (name, calories, protein, carbs, fat) that saves to device storage.
- **All Meals tab**: every meal, long-press to delete, "Clear All".

## Architecture

```
src/app/_layout.tsx            Root Stack (header hidden)
src/app/(tabs)/_layout.tsx     Bottom tabs: Home, Add Meal, All Meals
src/app/(tabs)/*.tsx           The three screens
src/app/styles/global.ts       Colors + shared styles
src/components/*               Presentational components (+ some logic)
src/storage/meals.ts           AsyncStorage CRUD: one JSON array under key "meals"
src/utils/notifications.ts     Daily local reminders (12:00, 18:00)
```

Data flow: each screen keeps its own `useState<Meal[]>` and reloads from AsyncStorage
with `useFocusEffect` every time its tab gains focus. There is no shared state; storage *is*
the source of truth and screens re-read it.

## Code review: what's wrong

Grouped the way you'd group comments in a real review: **blocking bugs → UX/a11y →
maintainability → tooling**. Interviewers care that you rank issues by impact rather than
listing every one.

### Blocking (wrong behaviour)

1. **"Today" totals are lifetime totals.** `MacroGrid`, `CopyButton` and `ShareButton` sum
   *every* stored meal, and the share text says "logged today". `createdAt` exists but is
   never used. After a week, the calories card shows a week of calories.
2. **`NaN` can be persisted.** `add-meal.tsx` only checks `calories` is non-empty, then calls
   `Number(calories)`. `"12a"`, or `"1,5"` from a European keyboard (relevant at Mollie!),
   becomes `NaN`, and after that every total renders `NaN` permanently.
3. **"Clear All" is one tap, no confirmation, irreversible.** Single delete asks first; the
   destructive bulk action doesn't. Inconsistent and dangerous.
4. **Hard-coded `paddingTop: 60`** in `globalStyles.container`. Wrong on every device that
   isn't roughly an iPhone 15; content collides with the Dynamic Island / status bar. Use
   safe-area insets.
5. **Status bar unreadable in light mode.** `app.json` has `userInterfaceStyle: "automatic"`
   but the UI is dark-only, so in system light mode iOS draws dark status-bar text on a dark
   background.
6. **`src/app/styles/global.ts` is inside the routes folder.** Expo Router treats every file
   in `src/app` as a route and warns that it has no default export.

### UX and accessibility

7. **Icon-only Share button has no `accessibilityLabel` or `accessibilityRole`.** VoiceOver
   reads "button" at best. (Accessibility was called out in the Mollie brief.)
8. **Delete is long-press only.** Undiscoverable, and impossible for many assistive-tech
   users. Provide an accessibility action and hint at minimum.
9. **Notification permission denied does nothing.** The switch silently stays off. Tell the
   user and offer a shortcut to Settings.
10. **Add Meal shows an `Alert` *and* navigates at the same time**, and uses `router.push("/")`
    to switch tabs (pushes onto history instead of navigating to the existing tab).

### Maintainability

11. **Totals logic duplicated 3×** (`MacroGrid`, `CopyButton`, `ShareButton`) and the summary
    string 2×. One pure helper should own it, which also makes it unit-testable.
12. **Theme bypassed.** `MacroCard` and `RecentMeals` hard-code `#a0a0b0`, `#ffffff`,
    `#16213e`; `meals.tsx` uses `"red"` despite `colors.alert`. A design system only works if
    it's the *only* source of colors.
13. **Leftovers:** `console.log` in Home, a `reset-project` script pointing at a deleted file,
    template splash colour (`#208AEF`).

### Tooling (lint: 5 errors, 7 warnings)

14. **Floating promises** (`Haptics.*`, `loadMeals()` in effects): unhandled rejections are
    swallowed. Await them or mark with `void`.
15. **Async function passed where `() => void` is expected** (`onDelete={loadMeals}`): the
    promise is dropped and errors vanish.
16. **`JSON.parse` returns `any`** in `getMeals`, so the `Meal[]` type is a lie with no runtime
    check.
17. `notifications.ts`: an `async` handler with no `await`, and comparing a permission
    status enum to a string literal.

## Interview angle

- **Lead with impact.** "Two things block merge: totals are wrong and bad input corrupts
  storage permanently. Then a11y. The rest is cleanup I'd leave as non-blocking suggestions."
- **Suggest, don't dictate.** Phrase comments as questions where intent is unclear ("Is
  `/` meant to reset the Home stack here?").
- **Spot what's missing, not just what's wrong:** no tests, no error handling around storage,
  no loading state, no localisation (hard-coded `"en-US"` date, English strings).
