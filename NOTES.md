# MacroZone: `feature/server-actions`

Builds on `feature/crud-hooks`. Same app, same screens, same hooks API. But:

1. **The server owns the data.** Meals live on a server (Expo Router API routes), not in
   AsyncStorage on the phone. Validation runs on the server too.
2. **React 19 actions replace `useState`.** `useActionState`, `useOptimistic`, `use()` and
   `Suspense` handle data, forms, pending and error states. There is no `useState`,
   `useEffect` or `useFocusEffect` anywhere in `src/` (`grep -rn useState src` → nothing).

Compare with `git diff feature/crud-hooks..feature/server-actions`.

## Branch map

| Branch | Built from | What it shows |
|---|---|---|
| `main` | n/a | Baseline app, unreviewed. Its NOTES.md is the code review |
| `fix/review-issues` | `main` | Review findings fixed, minimal changes |
| `feature/crud-hooks` | `fix/review-issues` | Full CRUD + hooks + context |
| `feature/server-actions` | `feature/crud-hooks` | Server-owned data + React 19 actions (this branch) |

## Running it

```bash
npx expo start          # API routes are served by the dev server
# press i for the iOS simulator
```

In development, the app's relative `fetch("/api/meals")` goes to the dev server
automatically. Data is written to `.data/meals.json` (git-ignored). Meals saved in
AsyncStorage on earlier branches don't carry over.

Try the API directly:

```bash
curl -X POST localhost:8081/api/meals -H 'Content-Type: application/json' \
  -d '{"name":"Oats","calories":"350","protein":"12,5","carbs":"60","fat":"7"}'
```

## Architecture

```text
Screen / component
   │  calls
   ▼
hooks (useMeals, useMealForm, useConfirmDelete, useReminders)   ← unchanged API for screens
   │  dispatch inside startTransition
   ▼
React 19 actions (useActionState + useOptimistic)               ← src/context, src/hooks
   │  await
   ▼
client actions  src/actions/meals.ts                            ← getMeals, saveMeal, deleteMeal, clearAllMeals
   │  fetch
   ▼
API routes      src/app/api/meals+api.ts, meals/[id]+api.ts     ← validate (shared pure fn) + persist
   │
   ▼
src/server/mealsStore.ts → .data/meals.json                     ← swap for Postgres/SQLite in prod
```

### API

| Method | Route | Success | Failure |
|---|---|---|---|
| GET | `/api/meals` | 200 `{ meals }` | n/a |
| POST | `/api/meals` | 201 `{ meals }` | 422 `{ errors }` |
| PUT | `/api/meals/:id` | 200 `{ meals }` | 422 `{ errors }`, 404 `{ errors }` |
| DELETE | `/api/meals/:id` | 200 `{ meals }` | n/a |
| DELETE | `/api/meals` | 200 `{ meals }` (clear all) | n/a |

Every mutation returns the **full updated list**, so the client never computes "what the
server probably has now"; it just takes the server's answer. Fine for a personal list;
for large collections you'd return the changed record and patch a cache.

## How each React 19 API is used

| API | Where | Replaces |
|---|---|---|
| `use(promise)` + `<Suspense>` | `MealsContext` initial load; `useReminders` preference | `useState` + `useEffect` + `isLoading` flag |
| `useActionState(action, initial)` | Meals list: every change is an action returning the new list | `useState<Meal[]>` + setters |
| `useActionState` | Form submit: returns `{ errors, version }`, gives `isPending` | `useState` for errors + `isSubmitting` |
| `useOptimistic` | Delete / clear-all remove rows instantly; reminder switch flips instantly | Manual "optimistic then rollback" code |
| `startTransition` | Wraps every `dispatch` (required outside `<form action>`) | n/a |
| `useRef` + uncontrolled inputs | Form field values (`defaultValue` + `onChangeText`) | 5× `useState` for fields |
| `key={version}` | Remounts inputs after a successful add → cleared form | `reset()` + setters |

**Error rollback for free:** if a delete fails, `mealsAction` catches it and returns the
*previous* list. When the transition ends, `useOptimistic` falls back to that real state, so
the row reappears. No hand-written rollback.

## Why API routes and not `"use server"` Server Functions

I first built this with Expo's **React Server Functions** (`"use server"`,
`experiments.reactServerFunctions`, `react-server-dom-webpack`), which is what "server
actions" literally means in React. It's still **beta** in Expo. On SDK 58.0.22 the dev server
fails before running any app code:

```text
Metro error: Unknown named module:
"…/metro-runtime/src/modules/empty-module.js?platform=web&env=react-server"
  at ensureSSRReady (@expo/cli/…/createServerComponentsMiddleware.js:354)
```

I ruled out my code by removing every import from the server file (same error) and by
upgrading to the latest SDK 58 patch (same error). The docs also list limits that matter
here: no `<form>` integration on native, "production deployment is limited and not
recommended yet", and EAS Update doesn't work with it.

So the server boundary is **API routes**, which are stable in SDK 58. The *client* side is
exactly what you'd write with Server Functions: components call async actions through
`useActionState`. Switching later means replacing `src/actions/meals.ts` with a
`"use server"` module that has the same function signatures; no screen or hook changes.

That's a strong interview story: *evaluated the cutting-edge option, hit a real bug,
contained the blast radius behind an interface, shipped the stable option.*

## Trade-offs and production gaps

- **Offline:** the app now needs the network. A real app would cache (React Query /
  persisted store) and queue mutations for when it's back online.
- **No auth / multi-user:** the store is one global list. Production needs auth and per-user
  rows.
- **JSON file store** isn't safe under concurrent writes; use a database.
- **Native production builds** need `origin` set on the `expo-router` plugin and the server
  deployed (EAS Hosting).
- **Validation runs only on submit.** With uncontrolled inputs, errors clear on the next
  submit, not as you type (that would need state again). A deliberate trade-off to show the
  pattern.
- `expo` / `expo-router` / `@expo/ui` were bumped to the latest SDK 58 patch on this branch
  (`npx expo install --fix`).

## Interview angle

- **"Where should validation live?"** Both sides. The client checks for fast feedback; the
  server is the authority. Here one pure function (`validateMealForm`) is shared by both.
- **"Optimistic UI: when not?"** Payments. At Mollie you would *not* optimistically show a
  refund as completed. Deleting a meal is low-risk; moving money is not. Say this.
- **"What does `useActionState` buy you over `useState`?"** It ties pending state, the
  result and errors to the *action* rather than to scattered flags. It also serialises
  dispatches, so double-taps can't race.
