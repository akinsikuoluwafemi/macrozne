# System design (UI) prep: Mollie, Senior UI Engineer, Merchant team

Context from the brief: Merchant team (the surfaces merchants use to **onboard, manage
payments and grow**). Cross-platform **React + React Native**. Most senior of 5 engineers,
reporting to the CTO. Called-out themes: **design system, accessibility, release processes,
CI/CD, localisation, developer experience.**

A UI system design interview is not backend system design. They want to see you design a
**client application**: its architecture, data flow, state, components, performance,
quality and delivery. Draw boxes for the *app*, not for Kafka.

---

## 1. The 45-minute framework

| Time | Step | What you do | Say out loud |
|---|---|---|---|
| 0–5 | **Clarify** | Users, platforms, core flows, scale, constraints | "Before I draw anything, let me pin down scope." |
| 5–10 | **Requirements** | Functional list + non-functional (perf, offline, a11y, i18n, security) | "These are the 3 flows I'll design in depth; the rest I'll mention." |
| 10–20 | **High-level architecture** | App shell, navigation, data layer, shared packages, API boundary | "Here's how the pieces talk to each other." |
| 20–35 | **Deep dives (2–3)** | Pick the interesting ones: data/offline, design system, a flow | "The hardest part is X, so let's go deep there." |
| 35–42 | **Quality and delivery** | Testing, CI/CD, releases, monitoring, a11y, i18n | "How we ship this safely and know it works." |
| 42–45 | **Trade-offs and next steps** | What you'd cut, what you'd revisit at 10× | "If I had another week…" |

Senior signals throughout: **state trade-offs explicitly, drive the conversation, tie
decisions to merchant/business impact, and mention the team** (how 5 engineers work in this).

### Clarifying questions to have ready

- Who's the user: a solo merchant on a phone, or a finance team on desktop? Both?
- Which flows matter most: onboarding, payments list, refunds, payouts, reporting?
- Web and native: same features, or is mobile a focused subset?
- Scale: transactions per merchant (10/day or 100k/day changes list design)?
- Offline expectations: read-only cached? Any offline writes (probably not for money)?
- Markets/languages at launch? (Mollie operates across many European countries.)
- Existing constraints: current API (REST? GraphQL?), existing design system, auth provider?

---

## 2. Worked example A: "Design the merchant mobile app"

### Requirements (example answer)

**Functional**
1. Log in securely (and re-authenticate for sensitive actions).
2. Dashboard: today's volume, recent payments, payout status.
3. Payments list: search, filter (status, method, date), infinite scroll, detail view.
4. Refund a payment (full or partial).
5. Push notifications (payment received, chargeback, payout sent).
6. Switch between organisations / profiles (merchants often have several).

**Non-functional**
- **Correctness of money above all.** Never show a wrong amount or a refund that didn't happen.
- **Security:** tokens in secure storage, biometric re-auth, no sensitive data in logs.
- **Performance:** fast cold start; smooth 60fps lists with thousands of rows.
- **Accessibility:** WCAG 2.2 AA equivalent; screen readers, dynamic type, contrast.
- **Localisation:** multiple languages, locale-correct currency/number/date formatting.
- **Offline-tolerant reads:** show cached data with a "last updated" stamp; block writes.
- **Shippable weekly** with safe rollouts and quick rollback.

### High-level architecture

```text
┌──────────────────────── Monorepo (pnpm/yarn workspaces + Turborepo/Nx) ───────────────────────┐
│                                                                                                │
│  apps/mobile (Expo, Expo Router)        apps/web (React, Next.js/Vite)                          │
│        │                                         │                                             │
│        └──────────────┬──────────────────────────┘                                             │
│                       ▼                                                                        │
│  packages/design-system   tokens → primitives → components (RN + web; same API, platform impls)│
│  packages/api-client      generated from OpenAPI: typed requests + Zod schemas                 │
│  packages/data            React Query hooks: usePayments, useRefund, query keys, cache policy  │
│  packages/i18n            message catalogs (ICU), formatters (Intl), locale detection          │
│  packages/domain          pure logic: money math, status mapping, validation (shared w/ server)│
│  packages/config          eslint, tsconfig, prettier, jest presets                             │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
                       │ HTTPS (OAuth/OIDC access token, short-lived; refresh token in secure store)
                       ▼
             Mollie API / BFF (backend-for-frontend aggregating dashboard data)
```

Talking points:
- **Share logic, not necessarily UI.** Domain logic, API client, data hooks and i18n are
  100% shared. Components share an *API* and tokens, with platform-specific implementations
  where native feel matters (date pickers, sheets, navigation).
- **A BFF** (backend-for-frontend) lets the dashboard make one request instead of five, and
  shapes payloads for mobile. Mention it as an option; don't assume it exists.
- **Generated API client** from OpenAPI means no hand-written types drifting from the backend.

### Navigation (Expo Router)

```text
(auth)/login, (auth)/mfa
(app)/(tabs)/home | payments | payouts | settings
(app)/payments/[id]          ← detail, deep-linkable from push notifications
(app)/payments/[id]/refund   ← modal / form sheet
(app)/org-switcher           ← modal
```

- Auth gate in the root layout: redirect to `(auth)` when there's no session.
- **Deep links from push** (`mollie://payments/tr_123`) open the detail screen directly.
  Handle "not logged in" (queue the link, open after login) and "wrong org" (switch first).

### Data layer: the most important deep dive

**Server state ≠ client state.** Use **TanStack Query** (React Query) for server state:
caching, dedupe, background refetch, retries, pagination, and persistence. Keep client
state (UI toggles, selected org) small: context or Zustand.

- **Query keys** include the org: `["payments", orgId, filters]`. Switching org can never
  show another org's data from cache.
- **Lists:** cursor-based pagination (`useInfiniteQuery`) + `FlashList`. Never offset
  pagination on a list where new payments arrive at the top (rows shift, you get duplicates).
- **Freshness:** `staleTime` short for payments (30s), refetch on app foreground and on
  push receipt. Real-time via push/SSE invalidating queries, not polling every second.
- **Offline reads:** persist the query cache (MMKV/AsyncStorage persister). Show a banner:
  "Offline. Showing data from 10:42."
- **Writes involving money are never optimistic.** Refund flow: confirm screen → biometric
  re-auth → request with an **idempotency key** (so a retry after a timeout can't refund
  twice) → pending state → success only when the API confirms. Contrast with low-risk
  writes (renaming a profile, marking a notification read): those can be optimistic.
  (See `feature/server-actions` in this repo: optimistic deletes for meals are fine; for
  refunds they wouldn't be.)
- **Money representation:** never floats. Mollie's public API represents amounts as
  `{ currency: "EUR", value: "10.00" }` strings. Keep them as strings/minor units, do math in
  integer cents (or a decimal lib), format only at the edge with `Intl.NumberFormat`.
- **Validation** shared between client and server where possible (pure functions/Zod in
  `packages/domain`), as in `feature/crud-hooks` → `feature/server-actions`.

### Security

- Tokens in **Keychain/Keystore** (`expo-secure-store`), never AsyncStorage.
- Short-lived access tokens + refresh; a single in-flight refresh promise so 5 parallel 401s
  trigger one refresh, not five.
- Biometric re-auth (`expo-local-authentication`) before refunds/payout changes.
- Blur the app switcher snapshot (sensitive amounts), log redaction, no PII in analytics.
- Optional: certificate pinning, jailbreak/root signals as risk inputs (not hard blocks).

### Performance

- Cold start: Hermes, minimal work before first render, lazy screens, splash held until
  auth state is known (no flash of login screen).
- Lists: `FlashList`, stable keys, memoised rows (React Compiler helps), avoid inline heavy
  formatting in render (pre-format in a selector).
- Images/charts: lazy, sized, cached (`expo-image`).
- Measure, don't guess: startup and TTI metrics in production (e.g. EAS Observe / Sentry
  performance), budgets in CI.

---

## 3. Worked example B: "Design merchant onboarding" (likely, given the team)

Onboarding = a long, regulated, multi-step form (KYC/KYB): business details, legal
representatives, UBOs, bank account, ID documents, website/business model.

Key design points:
- **Server-driven steps.** Requirements differ by country and legal entity type. The API
  returns the required steps/fields; the client renders them with a typed field registry.
  Adding a field for a new market shouldn't need an app release.
- **Save and resume.** Each step saves on completion (and drafts locally). Merchants leave
  to find documents and come back days later, on another device: the server holds progress.
- **Progress and status:** "3 of 6 complete", plus per-step states (not started, in
  progress, needs attention, verified). Verification is async: show "In review", push when
  it's done.
- **Document upload:** camera capture with edge detection/guide overlay, compression,
  resumable/chunked upload, retry on flaky mobile networks, clear file-type/size errors.
- **Validation:** inline, field-level, announced to screen readers; server is the
  authority (IBAN checks, VAT numbers); client mirrors cheap checks for speed.
- **Localisation is critical:** legal terms, address formats, name order, date formats
  differ per country. Don't concatenate strings. Use ICU messages with placeholders.
- **Measure the funnel:** step-level drop-off analytics; this is the team's growth lever.
- **Accessibility:** logical focus order, errors summarised at the top on submit, no
  time-outs that lose data, large touch targets.

---

## 4. Theme deep dives (one per brief keyword)

### Design system

- **Layers:** tokens (color, spacing, type, radius, motion) → primitives (Box, Text, Stack,
  Pressable) → components (Button, TextField, Amount, StatusBadge, ListRow) → patterns
  (forms, empty states, error states).
- **Tokens from one source** (e.g. Figma → Style Dictionary → TS for RN, CSS variables for
  web). Semantic tokens (`color.text.critical`) over raw (`red.600`), which enables dark
  mode and theming.
- **Same component API on web and native**, platform implementations behind it.
- **Accessibility built into components**, so product engineers get it by default (Button
  sets role, disabled/busy state; TextField links label and error).
- **Governance:** Storybook (web + RN), visual regression (Chromatic/Loki), usage linting
  ("no raw hex colors": `fix/review-issues` in this repo is exactly that cleanup), a
  contribution model so the 5 of you aren't a bottleneck, changelog + semver.
- **Adoption metrics:** % of screens using DS components, number of local overrides.

### Accessibility

- Targets: WCAG 2.2 AA on web; on native, VoiceOver/TalkBack, Dynamic Type/font scaling,
  contrast, reduced motion, 44×44pt targets.
- Every interactive element has role, label, state; icon-only buttons need labels (a
  finding in this repo's code review).
- Custom gestures (swipe/long-press) need accessibility actions as alternatives.
- Process: a11y acceptance criteria in tickets, automated checks (eslint-plugin-jsx-a11y,
  axe on web, RN testing-library `getByRole`), and **manual screen-reader passes** before
  release. Automation catches maybe a third of issues.

### Localisation (i18n / l10n)

- Message catalogs with **ICU MessageFormat** (plurals, gender, select): i18next or
  FormatJS. Never `"You have " + n + " payments"`.
- **Formatting with `Intl`:** currency (`€ 1.234,56` in nl-NL vs `€1,234.56` in en-IE),
  dates, relative times, lists. Currency is the *payment's*, locale is the *user's*.
- Translation pipeline: keys extracted in CI → TMS (Lokalise/Crowdin/Phrase) → pulled back;
  missing-key checks; pseudo-localisation to catch truncation (German is ~30% longer).
- OTA-updatable strings for native so a translation fix doesn't need a store release.
- Layout: flexible widths, no fixed-width buttons; RTL readiness if markets require it.

### Release process (mobile specifics)

- **Two release trains:** binary releases (store review, native code changes) and **OTA
  updates** (EAS Update: JS/assets only, same runtime version).
- **Runtime versions** guard OTA compatibility: an update only reaches binaries with
  matching native code.
- **Staged rollouts:** Play staged rollout %, App Store phased release; EAS Update rollouts
  to a % of users on a channel. Watch crash-free rate before going to 100%.
- **Feature flags** (LaunchDarkly/Unleash/in-house) decouple deploy from release; kill
  switches for risky features (e.g. new refund flow).
- **Forced/soft update** mechanism for when an old binary must stop (API deprecation,
  security).
- Rollback story: OTA → republish previous update; binary → halt rollout + fix forward.

### CI/CD

```text
PR:      lint → typecheck → unit tests (Jest) → component tests (RNTL) → affected-only via Turborepo
         → visual regression on DS → preview build / EAS Update preview channel linked in PR
main:    + E2E (Maestro/Detox) on simulators → internal build to TestFlight/Play internal track
release: version bump → store builds (EAS Build) → submit (EAS Submit) → staged rollout → monitor
```

- Fast feedback matters more than exhaustive pipelines: keep PR checks under ~10 minutes.
- PR previews (QR code to an EAS Update) let designers/PMs review on real devices.
- Protect `main`: required checks, CODEOWNERS for the design system package.

### Developer experience

- Monorepo with shared configs; one command to run any app.
- Generated API types; typed routes (Expo Router `typedRoutes`, enabled in this repo).
- Storybook for building components in isolation.
- Fast local loops: dev client builds shared via EAS so nobody needs Xcode set up on day one
  (remember the simulator saga setting up this repo).
- Docs: ADRs (architecture decision records) for big choices; templates for new screens.
- As the most senior engineer: measure DX (PR cycle time, CI duration, flaky test rate) and
  improve it deliberately.

### Observability

- Crash and error reporting (Sentry) with release + OTA update IDs attached.
- Performance: cold start, TTI, screen render times, slow frames.
- Product analytics: funnel events (onboarding steps, refund completion), privacy-safe.
- Alerting on crash-free sessions per release; dashboards per rollout.

### Testing strategy

| Layer | Tool | What |
|---|---|---|
| Unit | Jest | `packages/domain`: money math, validation, formatters |
| Hooks/components | React Native Testing Library | Behaviour via roles/labels (doubles as a11y check) |
| Contract | Zod schemas / Pact | API responses match what the app expects |
| Visual | Storybook + Chromatic/Loki | Design system regressions |
| E2E | Maestro or Detox | Login, view payment, refund (against a sandbox) |
| Manual | Screen reader + device matrix | Before each binary release |

---

## 5. Trade-off one-liners to have ready

- **Expo vs bare RN:** Expo (CNG, EAS, config plugins) unless a native SDK forces bare; and
  even then, prefer a config plugin or local Expo module.
- **React Query vs Redux:** server state belongs in a server-state cache; Redux/Zustand only
  for genuinely client-owned state.
- **Shared UI vs platform-specific UI:** share APIs/tokens, specialise where native
  conventions differ. Merchants notice when an iOS app feels like a web view.
- **OTA vs store release:** OTA for JS fixes and copy; never OTA anything that changes the
  native contract or violates store rules.
- **Optimistic UI:** yes for reversible low-risk actions; no for money movement.
- **Server-driven UI:** great for regulated, per-country forms (onboarding); overkill for
  stable screens.
- **New tech (RSC/Server Functions):** evaluate, but keep it behind an interface. In this
  repo, Expo Server Functions failed in beta, so the stable API routes shipped behind the
  same client contract (`feature/server-actions/NOTES.md`).

---

## 6. Practice prompts (do 2 out loud, timed, with a whiteboard)

1. Design the Mollie merchant mobile app's payments list + detail + refund.
2. Design merchant onboarding for 10 countries with different legal requirements.
3. Design a cross-platform design system for a 5-engineer team serving web + native.
4. Design the release process so the team can ship mobile weekly with confidence.
5. Design a dashboard showing real-time payment volume with charts, offline-tolerant.
6. "Our app's cold start is 4s on mid-range Android. Walk me through fixing it."

For each: clarify → requirements → diagram → 2 deep dives → quality/delivery → trade-offs.

---

## 7. Questions to ask them

- Is the merchant mobile app greenfield or existing? Expo or bare? How much is shared with web?
- Is there an existing design system, and who owns it?
- How do mobile releases work today: cadence, OTA, feature flags?
- How is accessibility tested today, and is there a target standard?
- How do translations get from product to the app?
- What does success look like for this role in the first 6 months?
- How does the team work with the CTO on technical direction?

---

## 8. Mapping this repo to interview stories

| Story | Branch | One-line pitch |
|---|---|---|
| Reviewing code by impact | `main` (NOTES.md) | "Two blocking bugs first, then a11y, then cleanup." |
| Scope discipline | `fix/review-issues` | "Fix PRs fix; refactors get their own PR." |
| Hooks as a seam | `feature/crud-hooks` | "Screens describe UI; hooks hide storage, so the data source can change." |
| Server-owned data, React 19 actions | `feature/server-actions` | "Shared validation, optimistic where safe, rollback for free." |
| Evaluating bleeding-edge tech | `feature/server-actions` | "Tried Server Functions, hit a beta bug, shipped stable behind the same interface." |
| Locale-correct input | `fix/review-issues` | "`12,5` from a Dutch keyboard used to become `NaN`." |
