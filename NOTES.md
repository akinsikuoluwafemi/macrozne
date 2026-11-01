# MacroZone: `fix/review-issues`

Every finding from the `main` code review, fixed with the **smallest change that solves it**.
No new features and no architectural rewrite: this is what a good "address review comments"
commit looks like. Compare with `git diff main..fix/review-issues`.

## Branch map

| Branch | Built from | What it shows |
|---|---|---|
| `main` | n/a | Baseline app, unreviewed. Its NOTES.md is the code review |
| `fix/review-issues` | `main` | Review findings fixed (this branch) |
| `feature/crud-hooks` | `fix/review-issues` | Full CRUD (incl. edit), custom hooks + context, shared form |
| `feature/server-actions` | `feature/crud-hooks` | Data on the server via Expo Server Functions, React 19 actions, no `useState` |

## What changed, finding by finding

| # | Problem on `main` | Fix | Where |
|---|---|---|---|
| 1 | Totals summed every meal ever | `getTodaysMeals()` filters by `createdAt`; Home passes `todaysMeals` to grid, copy and share | `src/utils/macros.ts`, `(tabs)/index.tsx` |
| 2 | `NaN` could be saved | `parseAmount()` accepts `12`, `12.5`, `12,5`; rejects anything non-numeric or negative. Keyboard is `decimal-pad` | `src/utils/macros.ts`, `(tabs)/add-meal.tsx` |
| 3 | Clear All had no confirmation | Destructive `Alert` with the count; button hidden when the list is empty | `(tabs)/meals.tsx` |
| 4 | Hard-coded `paddingTop: 60` | New `<Screen>` container uses `useSafeAreaInsets()`; every tab uses it | `src/components/Screen.tsx` |
| 5 | Unreadable status bar in light mode | `userInterfaceStyle: "dark"` + `<StatusBar style="light" />` | `app.json`, `app/_layout.tsx` |
| 6 | Theme file inside routes folder | Moved to `src/styles/global.ts`, imported via the `@/` alias | `src/styles/global.ts` |
| 7 | Icon-only Share button unlabeled | `accessibilityRole`, `accessibilityLabel`, bigger `hitSlop` | `ShareButton.tsx` |
| 8 | Delete was long-press only | `accessibilityActions` ("Delete meal") + hint: VoiceOver/TalkBack users get it in the actions rotor | `MealItem.tsx` |
| 9 | Denied permission = silent failure | Alert explaining why, with an "Open Settings" button | `ReminderToggle.tsx` |
| 10 | Alert + `router.push("/")` | Success haptic only, then `router.navigate("/")` (switches tab, doesn't stack history) | `(tabs)/add-meal.tsx` |
| 11 | Totals duplicated 3×, summary 2× | `getTotals()` and `formatSummary()`: pure, testable, single source | `src/utils/macros.ts` |
| 12 | Hard-coded colours | Added `colors.card`; all components use `colors.*`; `"red"` → `colors.alert` | `src/styles/global.ts` + components |
| 13 | Leftovers | Removed `console.log` and `reset-project` script; splash colour matches the app; added `npm run typecheck` | various |
| 14–17 | Lint: 5 errors, 7 warnings | `void` on fire-and-forget promises; `onDelete: () => Promise<void>` and awaited; `JSON.parse(...) as Meal[]`; `PermissionStatus.GRANTED` enum; non-async notification handler | various |
| bonus | Hard-coded `"en-US"` date | `toLocaleDateString(undefined, …)` follows the device locale | `HomeHeader.tsx` |

`npx tsc --noEmit` and `npx expo lint` are both clean.

## Decisions worth explaining

- **Why a `<Screen>` component and not `SafeAreaView` per screen?** One place owns layout
  concerns (insets, scroll, `keyboardShouldPersistTaps`). When designers change page padding,
  it's one edit. This is the seed of a design system: layout primitives first.
- **Why pass `todaysMeals` instead of filtering inside each component?** Components shouldn't
  each decide what "today" means. The screen decides *what* data to show; components decide
  *how* to show it. It also makes the prop name self-documenting.
- **Why `parseAmount` returns `null` instead of throwing?** Validation failure is an expected
  outcome, not an exceptional one. `null` forces the caller to handle it (the type is
  `number | null`).
- **`JSON.parse(...) as Meal[]` is still a cast.** Honest caveat: it silences the linter, but
  there's no runtime validation. In production I'd parse with a schema (e.g. Zod) because
  storage written by an older app version may not match today's type.

## What this branch deliberately does *not* do

- Each screen still has its own `useState` + `useFocusEffect` reload. Duplicated, but fixing
  it is an architectural change, so it belongs in its own PR → `feature/crud-hooks`.
- No edit. Also a feature, not a fix.
- No tests. `src/utils/macros.ts` is now pure functions, so it's trivial to unit-test; that'd
  be my next PR.

## Interview angle

"Scope discipline" is a senior signal: a review-fix PR should only fix what was reviewed.
Mixing in a refactor makes the PR harder to review and to revert. Say this out loud when an
interviewer asks "what would you change?": separate *must fix now* from *follow-up PR*.
