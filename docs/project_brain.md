# Bravery Bank — Project Brain

**Canonical source of truth for architecture, features, and decisions.**  
Last updated: 2026-03-18.

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
| **Build** | EAS CLI (cloud builds), expo-dev-client |

**Dev:** TypeScript, ESLint (expo lint). **App config:** `app.json` (Expo), `tsconfig.json` (path alias `@/`).

---

## 3. Folder structure

```
bravery-bank/
├── app/                    # Screens (file-based routes)
│   ├── _layout.tsx         # Root: SafeArea, Theme, BraveryBankProvider, Stack, onboarding check
│   ├── index.tsx          # Launcher: loads data, passes params to onboarding
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
│   ├── mascot/              # Blur character PNGs (6 poses)
│   │   ├── blur-confident.png
│   │   ├── blur-curious.png
│   │   ├── blur-excited.png
│   │   ├── blur-hello.png
│   │   ├── blur-resting.png
│   │   ├── blur-celebration.png
│   │   └── blur-sad-walk.png
├── docs/
│   ├── project_brain.md     # This file
│   └── design_spec.md    # Visual system reference (colors, type, spacing, components)
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
| `hasSeenReminderPrompt` | boolean | If true, skip reminder step in onboarding |
| `hasSeenCelebration` | boolean | If true, 50-day celebration card has been shown and dismissed |
| `hasCompletedFirstCycle` | boolean | If true, user has seen the post-completion welcome screen |

**Helpers:** `getTodayString()`, `daysBetween()`, `getCurrentWeekDays()` (Sunday–Saturday), `isDateCompleted(date, completedDates)`, `getDefaultData()`.

**New-day behavior:** On load, if `lastActivityDate !== today`, we advance `lastChallengeIndex` by 1 (regardless of how many days were missed — user always picks up the next challenge in sequence), set `todayStatus: 'none'`, and persist.

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
  - States: none (challenge + buttons), completed (checkmark + “You chose courage today”), rested (rest day card + “Actually, I’m feeling brave” button).

- **Mascot — “Blur” (Shy Bigfoot)**  
  - 6 character poses: confident, curious, excited, hello, resting, sad-walk. All flat vector PNGs with transparent backgrounds.  
  - Integrated into Today screen: rest day state shows `blur-resting.png` inside the rest day card.  
  - Mascot image is shown contextually based on `todayStatus`.

- **Rest day screen (updated)**  
  - Sleeping Blur is now inside the rest day card (above moon icon and rest copy).  
  - Added “Actually, I’m feeling brave” outlined button below the card — calls `returnToChallenge()` to let user return to today’s challenge after choosing rest.  
  - `returnToChallenge()` added to BraveryBankContext: sets `todayStatus` back to `'none'` and saves, so the challenge card reappears for the same day.

- **Progress screen**  
  - Brave Days total.  
  - When `totalBraveDays >= 50`, a permanent one-line badge appears below the encouragement text (above the corner Blur mascot): “✨ 50-Day Journey Complete” (accent teal, no card).  
  - This week: S–S with dots (filled + checkmark for completed days, teal ring for today).  
  - Copy varies by count (0, 1, 2–6, 7+).  
  - Settings gear → Settings modal.

- **Blur mascot on Progress screen (updated)**  
  - When totalBraveDays is 0: sad-walk Blur (blur-sad-walk.png) appears next to the Brave Days counter in a horizontal row layout, feet aligned with "Brave Days Total" baseline.  
  - When totalBraveDays > 0: Brave Days counter returns to original centered layout (no row). Excited Blur (blur-excited.png) appears in the bottom-right corner of the screen as a celebratory decorative element, absolutely positioned above the tab bar.

- **Challenges replaced (50 optimized)**  
  - All 50 challenges in data/challenges.ts replaced with new optimized set.  
  - 8 categories: Body & Breath (1–8), Digital Bravery (9–12), Small Communication (13–19), Speaking Up (20–23), Safe Observation (24–31), Self-Compassion (32–37), The Pause (38–42), Gentle Stretches (43–50).  
  - All challenges are solo-completable with no dependency on other people's actions.  
  - Challenges progress from gentle grounding to genuine social stretches.  
  - Four challenges updated March 14: #23 (overthinking→decision), #24 (eye contact→walk into room), #26 (no headphones→no phone), #34 (imperfect task→2-minute timer cleanup).  
  - Two challenge content replacements March 18: #6 ("Stretch your hands wide, spread your fingers, and hold for 5 seconds. Take up space.") and #7 ("Walk to the other side of the room slower than feels normal. Pay attention to each step.").

- **DEV: Skip to Next Challenge (temporary)**  
  - Developer-only skip button on Today screen for testing challenge copy.  
  - Advances lastChallengeIndex by 1, resets todayStatus to 'none', does not increment totalBraveDays.  
  - skipToNextChallenge() function added to BraveryBankContext.  
  - **TO BE REMOVED before release.**

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
  - 15 rotating message bodies (expanded from 3 in March 2026 session).

- **Notification tap deep-link**  
  - Tapping the daily reminder notification navigates to the Today screen (/(tabs)).  
  - Two listeners in `app/_layout.tsx`: `addNotificationResponseReceivedListener` for background/foreground taps, `getLastNotificationResponseAsync` for cold-start launches.  
  - Not guarded by isExpoGo — listeners are harmless without notifications active.

- **Notification copy (15 rotating messages)**  
  - `DAILY_MESSAGE_BODIES` in `utils/notifications.ts` expanded from 3 to 15 messages.  
  - Tone: warm, low-pressure, encouraging. Includes one Blur mascot callout.  
  - Rotation uses day-of-year modulo, so no repeat for ~2 weeks.

- **Permission denial handling**  
  - If OS denies notification permission during onboarding, user sees an Alert explaining how to enable in phone Settings; onboarding completes with notifications off.  
  - If OS denies when toggling on in Settings, Alert is shown and toggle stays off (no silent failure).  
  - Both `app/onboarding.tsx` and `hooks/useSettings.ts` updated.

- **Android production permissions (app.json)**  
  - `RECEIVE_BOOT_COMPLETED` — scheduled notifications survive phone restart.  
  - `SCHEDULE_EXACT_ALARM` — notifications fire at exact user-chosen time on Android 12+.

- **Welcome screen on every launch**  
  - App always opens to the onboarding welcome screen ("Bravery Bank / I'm Ready") as a warm entry point.  
  - Launcher screen (`app/index.tsx`) loads data, passes `hasSeenReminderPrompt` as a URL param to onboarding.  
  - `initialRouteName: 'index'` in `_layout.tsx` ensures no flash of the Today screen.  
  - Reminder prompt (step 2) shows only once, controlled by `hasSeenReminderPrompt` in storage.  
  - After first run, "I'm Ready" goes straight to Today screen.

- **Conditional welcome screen button labels**  
  - Welcome screen (`app/index.tsx`) button text changes based on app state.  
  - New challenge available (`todayStatus === 'none'` or new day detected via `lastActivityDate`): `I'm Ready`.  
  - Day already resolved (completed or rested, same day): `See how I'm doing`.  
  - One-time post-completion screen: when `braveDays >= 50` and `hasCompletedFirstCycle === false`, show "You completed all 50 challenges." / "Ready to go again?" / "Same challenges, braver you." with `blur-hello.png`. Button says `I'm Ready` and sets `hasCompletedFirstCycle = true`, so it only shows once.

- **Challenge advancement changed to sequential**  
  - When a new day is detected (`lastActivityDate !== today`), the challenge index advances by exactly 1 (wrapping after #50), regardless of how many days were missed.  
  - This preserves the intended difficulty progression across the 8 categories.

- **Tiered encouragement text on Progress screen**  
  - Encouragement text below "THIS WEEK" changes based on `totalBraveDays`:  
    - 0: "Your first brave moment is waiting."  
    - 1: "1 moment of courage. You've started something meaningful."  
    - 2–4: "[X] moments of courage. Keep going."  
    - 5: "5 moments of courage. Courage is becoming a habit."  
    - 6–9: "[X] moments of courage. Keep going."  
    - 10: "10 moments of courage. Look at you go."  
    - 11–24: "[X] moments of courage. Keep going."  
    - 25: "25 moments of courage. Halfway there. This is who you are now."  
    - 26–49: "[X] moments of courage. Keep going."  
    - 50: "50 moments of courage. You did it. All 50."  
    - 51+: "[X] moments of courage. Keep going."

- **50-day celebration screen**  
  - When `todayStatus === 'completed' && braveDays >= 50 && hasSeenCelebration === false`, Today replaces the normal completion UI with a dedicated celebration card.  
  - Card uses `blur-celebration.png` (180×180), includes the celebration title/subtitle/body, and a **Continue** button that fades in after 3 seconds.  
  - Tapping **Continue** sets `hasSeenCelebration = true` in AsyncStorage (via load-fresh-before-save) so the celebration shows exactly once.  
  - Custom confetti rain animation built with react-native-reanimated (replaced react-native-confetti-cannon). 80-100 pieces rain down with staggered delays, horizontal wobble, rotation, and fade-out. Runs ~5 seconds, then Continue button fades in after 7 seconds.
  - Challenges still cycle back to #1 on the next day via the normal day-change logic.

- **Dev build (Android)**  
  - EAS CLI configured, first dev build compiled and installed on Pixel 6.  
  - App ID: `com.harrygold.braverybank`  
  - Android Keystore generated and managed by EAS.  
  - `eas.json` configured with development, preview, and production profiles.  
  - `expo-dev-client` installed for dev build support.

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
- **Blur mascot integration for Today screen states (curious for challenge, excited for completion) and onboarding (hello/excited for welcome) — not yet started.**
- **UI visual refresh:** Gradient backgrounds, updated card styling not yet started.
- **DEV skip button needs to be removed before Google Play release.**
- **Design spec polish pass:** `docs/design_spec.md` documents the visual system. Typography (14 font sizes→standardize), opacity (4 levels→3), and button styling inconsistencies need to be applied to screens in a future pass.
- **Progress screen "50-Day Journey Complete" badge:** Implemented — shows when `braveDays >= 50` and remains visible for all higher counts.
- **Continue button styling:** The Continue button on the celebration card has a compressed pill appearance that needs fixing in the visual polish pass.
- **Typography issues on celebration screens:** The "g" descender is clipped on "courage" and "challenges" text. Celebration card text has orphaned words ("try" on its own line). To be fixed in the visual polish pass.
- **Milestone celebrations at 100, 150, 200:** Parked for V2. App functions correctly past 50 (counter keeps climbing, challenges cycle, encouragement text shows "Keep going") but has no special celebration moments beyond 50.

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

9. **Mascot state mapping**  
   Blur’s pose changes based on app state. The character is not decorative — it’s a reactive UI element tied to `todayStatus` and screen context. This makes the app feel alive and reinforces emotional tone per screen.

10. **Conditional Blur layout on Progress screen**  
    Progress screen uses two different layouts depending on totalBraveDays. When 0: horizontal flex row with counter + sad-walk Blur side by side. When > 0: centered vertical stack for counter, excited Blur absolutely positioned in bottom-right corner. This avoids layout conflicts and lets each state have its own visual feel.

11. **Notification tap uses two listeners**  
    `addNotificationResponseReceivedListener` handles taps when the app is backgrounded or foregrounded. `getLastNotificationResponseAsync` handles cold-start (app was killed, notification tap launched it). Both are needed because a single listener misses the cold-start case. Neither is guarded by isExpoGo since the listeners themselves are harmless.

12. **Design spec as vibe checker**  
    `docs/design_spec.md` documents the visual system: colors, typography scale, spacing, button styles, card patterns, mascot sizing, and opacity levels. Reference it in any Cursor prompt that involves UI work ("Follow the design spec in docs/design_spec.md") to prevent visual drift between screens. It's a living document — update it when intentional design changes are made.

13. **Launcher screen for clean routing**  
    `app/index.tsx` acts as the app entry point. It loads data from AsyncStorage, then passes key flags (like `hasSeenReminderPrompt`) as URL params to onboarding. This avoids race conditions between the BraveryBankContext and onboarding, and prevents the Today screen from flashing before onboarding appears. `_layout.tsx` sets `initialRouteName: 'index'`.

14. **Context actions load fresh data before saving**  
    `completeToday`, `restToday`, `returnToChallenge`, and `skipToNextChallenge` in BraveryBankContext now call `loadData()` before saving, spreading from the fresh result instead of in-memory state. This prevents stale context data from overwriting changes made by other parts of the app (e.g. onboarding saving `hasSeenReminderPrompt`).

15. **Challenge advancement is sequential, not calendar-based**  
    Changed from advancing by days-elapsed to advancing by exactly 1. This preserves the intended difficulty progression (Body & Breath → Gentle Stretches) even if the user takes breaks. The 50-challenge journey takes 50 active days regardless of calendar gaps.

16. **Celebration state is flag-controlled**  
    `hasSeenCelebration` ensures the 50-day celebration card shows exactly once. `hasCompletedFirstCycle` ensures the post-completion welcome screen ("You completed all 50 challenges") shows exactly once. Both flags persist in AsyncStorage and follow the load-fresh-before-saving pattern to avoid stale data overwrites.

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
