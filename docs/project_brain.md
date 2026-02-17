# Bravery Bank — Project Brain

**Canonical source of truth for architecture, features, and decisions.**  
Last updated: 2025-02 (stabilization pass).

---

## 1. Product summary

**Bravery Bank** is a mobile app for shy adults: “One tiny act of courage, every day.” Users see one gentle daily challenge, can mark it done (“I Did It”) or take a rest day (“Not Today”). Progress is tracked locally with no accounts. The app is Android-first, built with React Native (Expo).

---

## 2. Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 19, React Native 0.81 |
| **Meta-framework** | Expo SDK 54 |
| **Routing** | expo-router 6 (file-based) |
| **State** | React Context (BraveryBankProvider) + local hook state (useSettings) |
| **Persistence** | AsyncStorage (single JSON blob) |
| **UI** | React Navigation (Stack + Tabs), react-native-safe-area-context, react-native-reanimated |
| **Notifications** | expo-notifications (daily reminder; not available in Expo Go on Android SDK 53+) |
| **Time picker** | @react-native-community/datetimepicker |
| **Haptics** | expo-haptics |
| **Icons** | expo-symbols + custom IconSymbol mapping for Android |

**Dev:** TypeScript, ESLint (expo lint). **App config:** `app.json` (Expo), `tsconfig.json` (path alias `@/`).

---

## 3. Folder structure

```
bravery-bank/
├── app/                    # Screens (file-based routes)
│   ├── _layout.tsx         # Root: SafeArea, Theme, BraveryBankProvider, Stack, onboarding check
│   ├── (tabs)/
│   │   ├── _layout.tsx     # Tab navigator (Today, Progress)
│   │   ├── index.tsx       # Today screen
│   │   └── explore.tsx     # Progress screen
│   ├── onboarding.tsx      # First-run: Welcome + Daily reminder (2 steps)
│   ├── settings.tsx        # Settings (modal)
│   └── modal.tsx           # Placeholder modal
├── components/             # Reusable UI
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   ├── haptic-tab.tsx
│   └── ui/
│       ├── icon-symbol.tsx  # SF Symbol name → platform icon (Android mappings)
│       └── ...
├── constants/
│   └── theme.ts            # Colors (light/dark), Fonts
├── data/
│   └── challenges.ts       # 50 challenge strings + getChallenge(index), getTotalChallenges()
├── hooks/
│   ├── BraveryBankContext.tsx  # Shared app state (brave days, today status, complete/rest/reset)
│   ├── useBraveryBank.ts       # Consumer of context (re-export)
│   ├── useSettings.ts          # Settings state + persistence (load/save from same storage)
│   ├── use-color-scheme.ts
│   └── use-theme-color.ts
├── utils/
│   ├── storage.ts          # BraveryBankData, loadData, saveData, clearData, getTodayString, getCurrentWeekDays, isDateCompleted
│   └── notifications.ts    # Daily reminder: channel, schedule, cancel, test (Expo Go–guarded)
├── assets/images/          # Icons, splash
├── docs/
│   └── project_brain.md     # This file
├── app.json
├── package.json
└── tsconfig.json
```

---

## 4. Data model

**Single store:** one AsyncStorage key `bravery_bank_data` holding a JSON object.

**`BraveryBankData`** (see `utils/storage.ts`):

| Field | Type | Purpose |
|-------|------|---------|
| `totalBraveDays` | number | Lifetime count of “I Did It” days |
| `lastActivityDate` | string | Last date we updated (YYYY-MM-DD) |
| `lastChallengeIndex` | number | Index into challenges array for “next” challenge |
| `todayStatus` | `'completed' \| 'rested' \| 'none'` | Today’s choice |
| `completedDates` | string[] | All dates user chose “I Did It” (YYYY-MM-DD) |
| `createdAt` | string | ISO datetime |
| `darkMode` | boolean \| null | null = follow system |
| `hapticsEnabled` | boolean | Haptic on “I Did It” |
| `notificationsEnabled` | boolean | Daily reminder on/off |
| `notificationTime` | string | "HH:MM" (24h) |
| `hasCompletedOnboarding` | boolean | If false, show onboarding on launch |

**Helpers:** `getTodayString()`, `daysBetween()`, `getCurrentWeekDays()` (Sunday–Saturday), `isDateCompleted(date, completedDates)`, `getDefaultData()`.

**New-day behavior:** On load, if `lastActivityDate !== today`, we advance `lastChallengeIndex` by days elapsed (mod total challenges), set `todayStatus: 'none'`, and persist.

---

## 5. Auth

**None.** No login, no backend user. All data is local (AsyncStorage). Privacy copy: “No email. No password. No cloud. Just you.”

---

## 6. Implemented features

- **Onboarding (first launch / after Reset)**  
  - Step 1: Welcome (“Bravery Bank”, tagline, privacy line, “I’m Ready”).  
  - Step 2: “Would you like a gentle daily reminder?” — tappable “Remind me at [time]” (Android opens system time picker on tap), “Yes, remind me” / “Not now”, “You can always change this in Settings or turn it off anytime.”  
  - Root layout checks `hasCompletedOnboarding`; if false, shows loading then `router.replace('/onboarding')` so (tabs) never flashes.

- **Today screen**  
  - Header (Bravery Bank, tagline).  
  - Brave Days count (from context).  
  - Today’s challenge card (from `getChallenge(lastChallengeIndex)`).  
  - “I Did It” (completeToday) / “Not Today” (restToday).  
  - States: none (challenge + buttons), completed (checkmark + “You chose courage today”), rested (moon + “Rest day — that’s okay”).

- **Progress screen**  
  - Brave Days total.  
  - This week: S–S with dots (filled + checkmark for completed days, teal ring for today).  
  - Copy varies by count (0, 1, 2–6, 7+).  
  - Settings gear → Settings modal.

- **Settings (modal)**  
  - Haptic Feedback toggle.  
  - Theme (follows system; display only).  
  - Daily Reminder toggle + reminder time row (opens system time picker).  
  - “Send test notification now” (Expo Go: alert explaining it’s for dev builds).  
  - Danger zone: Reset All Data (confirmation; calls context `resetAllData` + settings `refreshFromStorage`).

- **Daily reminders**  
  - Channel `daily-reminder`, rotating body copy.  
  - Scheduled from `notificationTime`; rescheduled on app launch if enabled.  
  - **Expo Go:** Notifications code is not imported/run in Expo Go (`Constants.appOwnership === 'expo'`); preference is saved only.

- **Shared state**  
  - `BraveryBankProvider` at root holds bravery state; Today and Progress use `useBraveryBank()` so completion/rest updates everywhere without reload.

- **Reset flow**  
  - Settings → Reset → context clears storage, saves default, updates context; settings UI refreshes from storage; user can then be sent to onboarding by root layout on next navigation/launch if needed.

---

## 7. Unfinished / partial

- **Expo Go and notifications:** Daily reminders do not run in Expo Go; they work in development/production builds. Test notification in Settings shows an explanatory alert in Expo Go.
- **“I Did It” celebration:** No special animation or confetti yet (mentioned in PRD/conversation as optional).
- **README:** Still the default Expo README; not yet tailored to Bravery Bank (run, build, Expo Go vs dev build).
- **Stale `app/modal.tsx`:** Default placeholder; not part of current flows.

---

## 8. Architectural decisions to document

1. **Single JSON blob in AsyncStorage**  
   All app + settings state in one key. Simplifies reset and avoids sync issues. No per-feature keys.

2. **BraveryBankContext at root**  
   Today and Progress must show the same brave days and completion state. Each tab previously had its own `useBraveryBank()` state, so completion didn’t update the other tab. Moving logic into a single provider at root fixes that; Settings can call `resetAllData()` so reset is consistent.

3. **Onboarding check in root layout**  
   We don’t rely on the Today screen to redirect to onboarding. Root runs `loadData()` on mount and, if `!hasCompletedOnboarding`, calls `router.replace('/onboarding')` before hiding the loading overlay so (tabs) never flash.

4. **Expo Go–safe notifications**  
   `expo-notifications` is not loaded in Expo Go (Android SDK 53+). We guard with `Constants.appOwnership === 'expo'` and use dynamic `import('@/utils/notifications')` only when not in Expo Go. Onboarding and Settings still save reminder preference; scheduling runs only in dev/production builds.

5. **Android time picker on onboarding**  
   On Android, the system time picker is a dialog that can cover the screen. Onboarding step 2 shows the question and a tappable “Remind me at 9:00 AM” row; the picker opens only on tap so context is always visible.

6. **American week (Sunday first)**  
   `getCurrentWeekDays()` returns Sun–Sat; Progress labels S M T W T F S accordingly.

7. **Backfill for existing users**  
   If stored data has no `hasCompletedOnboarding`, we set it to `true` so existing users don’t see onboarding after an update.

8. **Settings and reset**  
   Reset is implemented in the bravery context (clear + save default + setState). Settings calls context `resetAllData()` then `refreshFromStorage()` so both bravery UI and settings form reflect the reset.

---

## 9. How to run

```bash
npm install
npx expo start
```

Use the QR code for Expo Go, or a dev/build target for notifications. Reset All Data in Settings to re-trigger onboarding.

---

## 10. Version control

- **Stabilization:** This doc and the current codebase are the baseline.  
- **Branching:** Use feature branches; merge to main after review.  
- **Commits:** Prefer clear, scoped messages (e.g. “fix: Brave Days not updating until reload”, “content: onboarding privacy and CTA copy”).  
- **.gitignore:** Standard Expo/Node (e.g. node_modules, .expo, env files); do not commit secrets.

---

*End of project_brain.md*
