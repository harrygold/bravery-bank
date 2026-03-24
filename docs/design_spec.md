# Bravery Bank — Design Spec

**Visual system reference for all screens. Use this file when giving Cursor any UI task.**  
Last updated: March 2026.

---

## 1. Brand identity

**Personality:** Warm, gentle, encouraging. Like a friend who believes in you.  
**Not:** Corporate, clinical, gamified, guilt-trippy, loud.  
**Mascot:** Blur — a shy Bigfoot. Reactive to app state, not decorative.

---

## 2. Colors

### Core palette

| Token | Value | Usage |
|-------|-------|-------|
| `ACCENT` | `#2A9D8F` | Primary actions, counters, active states, teal brand color |
| `ACCENT_SUBTLE` | `rgba(42, 157, 143, 0.2)` | Tinted backgrounds (e.g. onboarding time row) |
| `ACCENT_BORDER` | `rgba(42, 157, 143, 0.4)` | Borders on accent-tinted elements |
| `DANGER` | `#E07A5F` | Destructive actions only (Reset) |
| `ONBOARDING_BG` | `#1a1a2e` | Onboarding screens background (deep navy) |

### Surface colors (theme-aware)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `CARD_BG` | `#F0F9F8` | `#1E2A2A` | Cards (challenge, weekly, rest day) |
| `BORDER_SUBTLE` | `#E8E8E8` | `#2A3A3A` | Setting row dividers |
| `DOT_EMPTY_BORDER` | `#D0D0D0` | `#3A4A4A` | Unfilled weekly dots |

### Text on dark backgrounds (onboarding only)

| Token | Value | Usage |
|-------|-------|-------|
| `TEXT_ON_DARK` | `#FFFFFF` | Primary text on onboarding |
| `TEXT_ON_DARK_MUTED` | `rgba(255,255,255,0.6)` | Secondary text on onboarding |
| `TEXT_ON_DARK_SOFT` | `rgba(255,255,255,0.5)` | Hints on onboarding |

---

## 3. Typography scale

Use these sizes consistently. Do not introduce new sizes.

| Role | Size | Weight | Usage |
|------|------|--------|-------|
| **Display XL** | 80 | 700 | Progress screen brave days counter |
| **Display L** | 64 | 700 | Today screen brave days counter |
| **Heading XL** | 42 | 800 | Onboarding app name only |
| **Heading L** | 28 | 700 | Screen titles ("Bravery Bank", "Progress") |
| **Heading M** | 26 | 700 | Onboarding section titles |
| **Heading S** | 22 | 500 | Onboarding tagline |
| **Body L** | 18 | 600 | Completed text, counter labels, challenge text (500) |
| **Body M** | 16 | 600 | Setting labels, button text, encouragement text |
| **Body S** | 14 | 400 | Taglines, secondary descriptions |
| **Caption** | 13 | 400 | Hints, sub-labels, setting descriptions, week captions |
| **Micro** | 12 | 600 | Uppercase labels (challenge label, week label, danger zone label), day labels |

### Rules
- **Labels and section headers:** Always `letterSpacing: 1` + `textTransform: 'uppercase'` at Micro size.
- **Never use font size 15 or 17.** These are in the current codebase (settings, onboarding) but should consolidate to 16 or 18 respectively in future passes.

---

## 4. Opacity

Use only these three levels for muted/secondary content:

| Level | Value | Usage |
|-------|-------|-------|
| **Muted** | `0.7` | Secondary buttons, encouragement text |
| **Subtle** | `0.6` | Descriptions, sub-labels, captions, day labels |
| **Faint** | `0.5` | Danger zone description, week caption |

Do not use `0.45` or `0.9` — consolidate to the nearest level above.

---

## 5. Spacing

### Screen layout
- **Screen horizontal padding:** `24` (all screens)
- **Android extra top padding:** `48` (Today), `16` (Progress)
- **Section spacing (vertical):** `32` between major sections, `16` within sections

### Cards
- **Card padding:** `24` (all cards)
- **Card bottom margin:** `32`

---

## 6. Shapes

| Element | Border radius |
|---------|--------------|
| Cards | `16` |
| Buttons (primary, secondary, settings) | `12` |
| Pill buttons (e.g. "I'm feeling brave") | `25` |
| Weekly dots | `16` (full circle at 32x32) |

---

## 7. Buttons

### Primary button
- Background: `ACCENT` (`#2A9D8F`)
- Text: `#FFFFFF`, size 18 (Today "I Did It") or 17 (onboarding/settings)
- Weight: 700 (Today) or 600 (onboarding/settings)
- Padding: `paddingVertical: 18`
- Radius: `12`
- Full width (`alignSelf: 'stretch'`)

**Recommendation for consistency:** Standardize all primary buttons to size 18, weight 700.

### Secondary button (text only)
- No background, no border
- Text color: theme text color
- Opacity: `0.7`
- Size: 16, weight 500
- Padding: `paddingVertical: 12`

### Outlined button (e.g. "I'm feeling brave", test notification)
- Background: transparent
- Border: `1px` solid `ACCENT`
- Text: `ACCENT` color
- Size: 16, weight 600
- Radius: `25` (pill) or `12` (rectangular)

### Danger button
- Border: `1px` solid `DANGER`
- Text: `DANGER` color
- Size: 16, weight 600
- Radius: `12`

---

## 8. Cards

All content cards share:
- Background: `CARD_BG` (theme-aware)
- Radius: `16`
- Padding: `24`
- No border, no shadow

States:
- **Active:** `opacity: 1`
- **Completed/rested:** `opacity: 0.6`

---

## 9. Mascot (Blur) sizing

| Context | Width × Height | Notes |
|---------|---------------|-------|
| Onboarding welcome | 240 × 240 | Centered, below text block |
| Onboarding reminder | 340 × 340 | Centered, sleeping pose |
| Today screen (rest day card) | 180 × 180 | Inside rest day card |
| Progress screen (0 brave days) | 110 × 110 | Beside counter in row |
| Progress screen (>0 brave days) | 145 × 145 | Bottom-right corner, absolute positioned |

All Blur images: `resizeMode="contain"`, real PNGs with alpha transparency.

---

## 10. Component checklist for new screens

When building any new screen, verify:

- [ ] Screen uses `paddingHorizontal: 24`
- [ ] Colors reference the tokens above, not new hex values
- [ ] Font sizes come from the typography scale (no new sizes)
- [ ] Cards use `borderRadius: 16`, buttons use `12`
- [ ] Muted text uses opacity `0.6` or `0.7`, not a custom value
- [ ] Primary button matches the spec (accent bg, white text, size 18, weight 700, radius 12)
- [ ] Dark mode tested (card backgrounds, borders, text all adapt)
- [ ] Blur mascot sized per the table above for its context

---

## 11. Known inconsistencies to clean up (V2)

These exist in the current codebase and should be addressed in a future polish pass:

1. **Font sizes 15 and 17** are used in settings and onboarding — should become 16 and 18.
2. **Opacity 0.45** on dev skip button — remove with the button itself.
3. **`ACCENT_COLOR_LIGHT` (`#40B4A6`)** is defined in `index.tsx` but never used — remove.
4. **Primary button weight varies** between 600 (onboarding, settings) and 700 (Today) — standardize to 700.
5. **Primary button text size varies** between 17 (onboarding, settings) and 18 (Today) — standardize to 18.
6. **Android top padding differs** between screens (48 on Today, 16 on Progress) — consider standardizing.
7. **Colors are defined as constants per-file** — consider a shared `colors.ts` or extending `theme.ts` so changes propagate everywhere.

---

*End of design_spec.md*
