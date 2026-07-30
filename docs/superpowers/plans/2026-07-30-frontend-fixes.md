# Frontend Fixes (Top 6) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the six highest-priority frontend defects found in the review of the Punto de Agua webapp: a save button that deadlocks in the field-reading flow, a broken list layout, a cramped mobile metadata row, a wrong `lang` attribute, a photo input that doesn't open the camera, and navigation that is buried in a single dropdown.

**Architecture:** Five of the six are localized markup/attribute fixes with no new abstractions. The sixth (navigation) adds a role-aware navigation layer: one pure config+predicate module (`src/navigation/main-nav-items.ts`), a fixed mobile bottom bar (`BottomNav`), and a desktop sidebar (`MainSidebar`) mounted in the existing — currently unused — `SidebarProvider` in `(main)/layout.tsx`. The reading-validation bug is fixed by extracting the validation rules into a pure, unit-tested module (`src/lib/reading-validation.ts`) and removing the error from the button's `disabled` condition.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Radix), `bun:test`, Biome.

## Global Constraints

- **UI language is Spanish.** Every user-visible string added must be Spanish. Code identifiers and comments stay English, matching the existing codebase.
- **Test runner is `bun:test`.** Import from `'bun:test'`. Run with `bun test <path>`. There is no jsdom, no React Testing Library, and no component-test infrastructure — **do not add any**. Only pure functions get automated tests; markup changes are verified manually per the steps below.
- **Formatter/linter is Biome 2.2.2.** Run `bun x biome check --write <paths>` before each commit. Config is `biome.jsonc` at the repo root.
- **Mobile breakpoint is 768px** (`md:` in Tailwind, `MOBILE_BREAKPOINT` in `src/hooks/use-mobile.ts`). Prefer CSS breakpoints over the `useIsMobile()` JS hook for new code — the hook returns `false` on first render and causes a visible layout flash.
- **Reader-only users are route-restricted.** `src/lib/water-meter-reader-paths.ts` limits `WATER_METER_READER`-only users to `/water-meter/new`, `/water-meter/[id]`, `/unauthorized`, `/privacy`, `/terms`. Navigation must never show them a link they cannot open.
- **Do not touch `src/app/admin/**`.** The admin area is a separate template-derived surface and is out of scope.
- **Scope discipline.** This plan fixes exactly the six listed defects. Known adjacent issues deliberately **not** fixed here: `Date.now()` in React keys (4 sites), ~200 hardcoded color classes, the duplicated mobile/desktop branches inside `add-reading-modal.tsx`, nested `<main>` elements, and doubled container padding. Do not opportunistically fix them; they belong in follow-up work.

---

## File Structure

**New files:**

| File | Responsibility |
|---|---|
| `apps/webapp/src/lib/reading-validation.ts` | Pure validation rules for a water-meter reading. No React, no I/O. |
| `apps/webapp/src/lib/reading-validation.test.ts` | `bun:test` unit tests for the above. |
| `apps/webapp/src/navigation/main-nav-items.ts` | Nav item config for the `(main)` app + pure `getMainNavItems(roles)` and `isNavItemActive(url, pathname)` helpers. |
| `apps/webapp/src/navigation/main-nav-items.test.ts` | `bun:test` unit tests for the above. |
| `apps/webapp/src/components/layout/bottom-nav.tsx` | Fixed mobile bottom navigation bar (`md:hidden`). |
| `apps/webapp/src/components/layout/main-sidebar.tsx` | Desktop sidebar for the `(main)` app (`hidden md:block` via Sidebar's own behavior). |

**Modified files:**

| File | Change |
|---|---|
| `apps/webapp/src/app/layout.tsx:31` | `lang="en"` → `lang="es"`. |
| `apps/webapp/src/app/(main)/water-meter/new/_components/add-reading-modal.tsx` | Use `validateReading`; clear error on every field change; drop error from `disabled`; render error next to the offending field; add `capture="environment"` to the photo input. |
| `apps/webapp/src/app/(main)/water-meter/[id]/_components/edit-reading-modal.tsx` | Add `capture="environment"` to the photo input. |
| `apps/webapp/src/app/(main)/incident/new/page.tsx` | Add `capture="environment"` to the photo input. |
| `apps/webapp/src/app/(main)/water-meter/_components/water-meter-list.tsx:119` | Add `className="block"` to the `<Link>`. |
| `apps/webapp/src/app/(main)/water-meter/new/_components/water-meter-item.tsx:39` | Add `flex-wrap` + split gaps to the metadata row. |
| `apps/webapp/src/app/(main)/layout.tsx` | Mount `MainSidebar` + `BottomNav`; add bottom padding so content clears the fixed bar. |
| `apps/webapp/src/components/layout/header.tsx` | Add `SidebarTrigger` (desktop only); fix hamburger contrast. |

---

## Task 1: Fix the reading-validation deadlock

**Why:** In `add-reading-modal.tsx`, the Save button is `disabled` while `validationError` is set, but `validationError` is only cleared inside `handleReadingChange`. A user who enters a future date gets an error, corrects the date, and the button stays disabled forever. This is the app's most-used form.

**Files:**
- Create: `apps/webapp/src/lib/reading-validation.ts`
- Test: `apps/webapp/src/lib/reading-validation.test.ts`
- Modify: `apps/webapp/src/app/(main)/water-meter/new/_components/add-reading-modal.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces:
  ```ts
  export type ReadingValidationField = 'reading' | 'date'
  export interface ReadingValidationError {
    field: ReadingValidationField
    message: string
  }
  export interface ValidateReadingInput {
    normalizedReading: number
    readingDate: Date
    lastReadingValue: number | null
    lastReadingDate: Date | null
    now: Date
  }
  export function validateReading(input: ValidateReadingInput): ReadingValidationError | null
  ```
  `normalizedReading` is already parsed and unit-normalized to litres by the caller — the function does no string parsing and no unit conversion.

- [ ] **Step 1: Write the failing test**

Create `apps/webapp/src/lib/reading-validation.test.ts`:

```ts
import { describe, expect, it } from 'bun:test'
import { validateReading } from './reading-validation'

const NOW = new Date('2026-07-30T12:00:00')

function input(overrides: Partial<Parameters<typeof validateReading>[0]> = {}) {
  return {
    normalizedReading: 5000,
    readingDate: new Date('2026-07-30T11:00:00'),
    lastReadingValue: 4000,
    lastReadingDate: new Date('2026-07-01T10:00:00'),
    now: NOW,
    ...overrides
  }
}

describe('validateReading', () => {
  it('accepts a valid reading', () => {
    expect(validateReading(input())).toBeNull()
  })

  it('rejects a future date and blames the date field', () => {
    const error = validateReading(input({ readingDate: new Date('2026-07-31T09:00:00') }))
    expect(error).toEqual({
      field: 'date',
      message: 'La fecha y hora no pueden ser futuras'
    })
  })

  it('rejects a date at or before the last reading and blames the date field', () => {
    const error = validateReading(input({ readingDate: new Date('2026-07-01T10:00:00') }))
    expect(error).toEqual({
      field: 'date',
      message: 'La nueva lectura debe ser posterior a la última lectura'
    })
  })

  it('rejects a value lower than the last reading and blames the reading field', () => {
    const error = validateReading(input({ normalizedReading: 3999 }))
    expect(error).toEqual({
      field: 'reading',
      message: 'La nueva lectura no puede ser menor que la última lectura'
    })
  })

  it('allows a value equal to the last reading', () => {
    expect(validateReading(input({ normalizedReading: 4000 }))).toBeNull()
  })

  it('skips last-reading checks when there is no previous reading', () => {
    const error = validateReading(
      input({ normalizedReading: 0, lastReadingValue: null, lastReadingDate: null })
    )
    expect(error).toBeNull()
  })

  it('reports the date problem first when both date and value are invalid', () => {
    const error = validateReading(
      input({ normalizedReading: 1, readingDate: new Date('2026-07-31T09:00:00') })
    )
    expect(error?.field).toBe('date')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd /home/agustin/src/puntodeagua && bun test apps/webapp/src/lib/reading-validation.test.ts
```

Expected: FAIL — `Cannot find module './reading-validation'`.

- [ ] **Step 3: Write the minimal implementation**

Create `apps/webapp/src/lib/reading-validation.ts`:

```ts
export type ReadingValidationField = 'reading' | 'date'

export interface ReadingValidationError {
  field: ReadingValidationField
  message: string
}

export interface ValidateReadingInput {
  /** Reading already parsed and normalized to litres by the caller. */
  normalizedReading: number
  readingDate: Date
  lastReadingValue: number | null
  lastReadingDate: Date | null
  now: Date
}

export function validateReading({
  normalizedReading,
  readingDate,
  lastReadingValue,
  lastReadingDate,
  now
}: ValidateReadingInput): ReadingValidationError | null {
  if (readingDate > now) {
    return { field: 'date', message: 'La fecha y hora no pueden ser futuras' }
  }

  if (lastReadingDate && readingDate <= new Date(lastReadingDate)) {
    return { field: 'date', message: 'La nueva lectura debe ser posterior a la última lectura' }
  }

  if (lastReadingValue !== null && normalizedReading < lastReadingValue) {
    return { field: 'reading', message: 'La nueva lectura no puede ser menor que la última lectura' }
  }

  return null
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd /home/agustin/src/puntodeagua && bun test apps/webapp/src/lib/reading-validation.test.ts
```

Expected: PASS — 7 pass, 0 fail.

- [ ] **Step 5: Commit the pure module**

```bash
cd /home/agustin/src/puntodeagua
bun x biome check --write apps/webapp/src/lib/reading-validation.ts apps/webapp/src/lib/reading-validation.test.ts
git add apps/webapp/src/lib/reading-validation.ts apps/webapp/src/lib/reading-validation.test.ts
git commit -m "feat(webapp): add pure reading validation module"
```

- [ ] **Step 6: Wire the module into the modal**

In `apps/webapp/src/app/(main)/water-meter/new/_components/add-reading-modal.tsx`:

Add the import alongside the other `@/lib` imports:

```ts
import { type ReadingValidationError, validateReading } from '@/lib/reading-validation'
```

Change the error state declaration (currently line 67) from:

```ts
const [validationError, setValidationError] = useState<string | null>(null)
```

to:

```ts
const [validationError, setValidationError] = useState<ReadingValidationError | null>(null)
```

Replace the three inline `if` checks inside `handleSubmitReading` (currently lines 126-146, from `if (readingDate > new Date()) {` through `setValidationError(null)`) with:

```ts
    const error = validateReading({
      normalizedReading: normalizeReading(readingForm.reading),
      readingDate,
      lastReadingValue,
      lastReadingDate,
      now: new Date()
    })

    if (error) {
      setValidationError(error)
      return
    }

    setValidationError(null)
```

- [ ] **Step 7: Clear the error on every field change**

Still in `add-reading-modal.tsx`, add this helper just above `handleReadingChange`:

```ts
  const updateField = (field: 'readingDate' | 'readingTime' | 'notes', value: string) => {
    setReadingForm((prev) => ({ ...prev, [field]: value }))
    setValidationError(null)
  }
```

Then replace **all four** date/time `onChange` handlers — two in the mobile branch (currently ~lines 262 and 275) and two in the desktop branch (currently ~lines 383 and 398). Each currently reads:

```tsx
onChange={(e) => setReadingForm((prev) => ({ ...prev, readingDate: e.target.value }))}
```

Replace with (using the matching field name, `readingDate` or `readingTime`):

```tsx
onChange={(e) => updateField('readingDate', e.target.value)}
```

- [ ] **Step 8: Remove the error from the disabled condition and place it next to the right field**

Both Save buttons (currently lines 195 and 468) read:

```tsx
disabled={!readingForm.reading || addReadingMutation.isPending || !!validationError}
```

Replace both with:

```tsx
disabled={!readingForm.reading || addReadingMutation.isPending}
```

The reading `<Input>` in both branches has `className={validationError ? 'border-red-500' : ''}`. Replace both with:

```tsx
className={validationError?.field === 'reading' ? 'border-red-500' : ''}
```

Both branches render the error under the reading input:

```tsx
{validationError && <p className="text-sm text-red-500 mt-1">{validationError}</p>}
```

Replace both with a reading-only version:

```tsx
{validationError?.field === 'reading' && (
  <p className="text-sm text-red-500 mt-1">{validationError.message}</p>
)}
```

Then add a date-scoped error message. In the **mobile** branch, immediately after the closing `</div>` of the `grid grid-cols-2 gap-4` date/time wrapper (currently ~line 279), insert:

```tsx
{validationError?.field === 'date' && (
  <p className="text-sm text-red-500 -mt-2">{validationError.message}</p>
)}
```

In the **desktop** branch, immediately after the closing `</div>` of the Hora row (currently ~line 402), insert:

```tsx
{validationError?.field === 'date' && (
  <p className="col-span-4 text-right text-sm text-red-500">{validationError.message}</p>
)}
```

- [ ] **Step 9: Verify manually**

```bash
cd /home/agustin/src/puntodeagua && bun run webapp
```

Open `http://localhost:3005/water-meter/new`, pick any meter, open "Nueva Lectura", then confirm all four:

1. Enter a valid reading, set the date to tomorrow, press Guardar → error "La fecha y hora no pueden ser futuras" appears **under the date/time row**.
2. Set the date back to today → the error disappears and Guardar is **still enabled**. (This is the bug being fixed — before this change the button stayed dead.)
3. Press Guardar → the reading saves.
4. Enter a reading lower than the last one → the error appears **under the reading field** and the field border turns red.

- [ ] **Step 10: Commit**

```bash
cd /home/agustin/src/puntodeagua
bun x biome check --write "apps/webapp/src/app/(main)/water-meter/new/_components/add-reading-modal.tsx"
git add "apps/webapp/src/app/(main)/water-meter/new/_components/add-reading-modal.tsx"
git commit -m "fix(webapp): unblock save button after correcting a reading date

The save button was disabled whenever validationError was set, but the
error was only cleared when the reading field changed. Correcting an
invalid date left the button permanently dead. Validation now runs on
submit only, clears on any field change, and renders next to the field
it refers to."
```

---

## Task 2: Set the document language to Spanish

**Why:** `<html lang="en">` on a fully Spanish UI makes screen readers apply English pronunciation rules to Spanish text.

**Files:**
- Modify: `apps/webapp/src/app/layout.tsx:31`

**Interfaces:**
- Consumes: nothing. Produces: nothing.

- [ ] **Step 1: Change the attribute**

In `apps/webapp/src/app/layout.tsx`, the `<html>` tag currently reads:

```tsx
    <html
      lang="en"
      className={playfairDisplay.variable}
      data-theme-preset={themePreset}
      suppressHydrationWarning
    >
```

Change `lang="en"` to `lang="es"`.

- [ ] **Step 2: Verify**

```bash
cd /home/agustin/src/puntodeagua && bun run webapp
```

Load any page, open DevTools, and confirm the root element is `<html lang="es" ...>`.

- [ ] **Step 3: Commit**

```bash
cd /home/agustin/src/puntodeagua
git add apps/webapp/src/app/layout.tsx
git commit -m "fix(webapp): set document language to Spanish"
```

---

## Task 3: Open the camera directly for photo capture

**Why:** Meter photos are taken in the field. Without `capture`, the OS shows a file picker instead of the camera, costing 2-3 extra taps per reading. `capture="environment"` requests the rear camera; desktop browsers ignore the attribute, so there is no desktop regression.

**Files:**
- Modify: `apps/webapp/src/app/(main)/water-meter/new/_components/add-reading-modal.tsx` (1 input)
- Modify: `apps/webapp/src/app/(main)/water-meter/[id]/_components/edit-reading-modal.tsx` (1 input)
- Modify: `apps/webapp/src/app/(main)/incident/new/page.tsx` (1 input)

**Interfaces:**
- Consumes: nothing. Produces: nothing.

- [ ] **Step 1: Locate every photo input**

```bash
cd /home/agustin/src/puntodeagua
grep -rn 'type="file"' "apps/webapp/src/app/(main)"
```

Expected: one match in each of the three files above. `add-reading-modal.tsx` has the input inside **both** the mobile and desktop branches — check whether `grep` returns one or two hits for that file and handle every hit.

- [ ] **Step 2: Add the attribute to each match**

Each input currently reads:

```tsx
<Input
  id="image"
  type="file"
  accept={ACCEPTED_FILE_TYPES}
  onChange={handleImageSelect}
  disabled={addReadingMutation.isPending}
/>
```

Add `capture="environment"` directly after the `accept` prop:

```tsx
<Input
  id="image"
  type="file"
  accept={ACCEPTED_FILE_TYPES}
  capture="environment"
  onChange={handleImageSelect}
  disabled={addReadingMutation.isPending}
/>
```

Note: prop names and the `disabled` expression differ slightly between the three files (the incident page uses a different mutation variable). Only add the `capture` attribute — leave every other prop exactly as it is.

- [ ] **Step 3: Verify the types compile**

```bash
cd /home/agustin/src/puntodeagua && bun x tsc --noEmit -p apps/webapp/tsconfig.json 2>&1 | grep -E "add-reading-modal|edit-reading-modal|incident/new"
```

Expected: no output. (`capture` is a valid React DOM attribute; if it errors, the `Input` component is over-narrowing its props — report that rather than casting.)

**Note on the pre-existing baseline:** `tsc` over this project reports ~17 unrelated errors in `packages/**` that exist on `main`. Filter to the files you touched, as the command above does. Do not attempt to fix the `packages/**` errors — they are out of scope.

- [ ] **Step 4: Verify on a real device**

Open the app on a phone (or Chrome DevTools device emulation will *not* prove this — the attribute only takes effect on real mobile hardware). Tap "Foto" in the Nueva Lectura modal → the camera should open directly rather than a file browser.

If no device is available, confirm the rendered HTML instead:

```bash
# In the browser console on the reading modal:
document.querySelector('#image').getAttribute('capture')  // → "environment"
```

- [ ] **Step 5: Commit**

```bash
cd /home/agustin/src/puntodeagua
bun x biome check --write "apps/webapp/src/app/(main)"
git add "apps/webapp/src/app/(main)/water-meter/new/_components/add-reading-modal.tsx" \
        "apps/webapp/src/app/(main)/water-meter/[id]/_components/edit-reading-modal.tsx" \
        "apps/webapp/src/app/(main)/incident/new/page.tsx"
git commit -m "feat(webapp): open rear camera directly for meter and incident photos"
```

---

## Task 4: Fix the two list layout defects

**Why:** Two independent CSS bugs in the meter lists.

1. `water-meter-list.tsx:119` puts `<Link>` (which renders an inline `<a>`) directly inside `<div className="space-y-2">`. Tailwind's `space-y-*` applies `margin-top`, which CSS ignores on inline elements — so the cards render with zero gap. The sibling list (`water-meter-item.tsx`) already gets this right with `className="block"`.
2. `water-meter-item.tsx:39` is a `flex` row holding 4-5 spans separated by `•` with **no** `flex-wrap`. At 375px each span shrinks to its min-content width and the text breaks into narrow vertical columns.

**Files:**
- Modify: `apps/webapp/src/app/(main)/water-meter/_components/water-meter-list.tsx:119`
- Modify: `apps/webapp/src/app/(main)/water-meter/new/_components/water-meter-item.tsx:39`
- Modify: `apps/webapp/src/app/(main)/water-meter/_components/water-meter-list.tsx:133`

**Interfaces:**
- Consumes: nothing. Produces: nothing.

- [ ] **Step 1: Make the card link a block element**

In `apps/webapp/src/app/(main)/water-meter/_components/water-meter-list.tsx`, line 119 currently reads:

```tsx
        <Link key={waterMeter.id} href={`/water-meter/${waterMeter.id}`}>
```

Change to:

```tsx
        <Link key={waterMeter.id} href={`/water-meter/${waterMeter.id}`} className="block">
```

- [ ] **Step 2: Let the dense metadata row wrap**

In `apps/webapp/src/app/(main)/water-meter/new/_components/water-meter-item.tsx`, line 39 currently reads:

```tsx
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
```

Change to:

```tsx
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
```

`gap-x-3`/`gap-y-1` keeps horizontal separation readable while tightening the vertical rhythm once the row wraps to multiple lines.

- [ ] **Step 3: Let the card metadata row wrap too**

In `apps/webapp/src/app/(main)/water-meter/_components/water-meter-list.tsx`, line 133 currently reads:

```tsx
                  <div className="flex items-center gap-1">
```

This is the inner row holding the MapPin icon, point name, connection number and litres — same non-wrapping problem. Change to:

```tsx
                  <div className="flex flex-wrap items-center gap-1">
```

- [ ] **Step 4: Verify at 375px**

```bash
cd /home/agustin/src/puntodeagua && bun run webapp
```

In Chrome DevTools set the device to iPhone SE (375px wide), then:

1. Visit `/water-meter` → cards have a visible ~8px gap between them (before the fix they were flush against each other).
2. Visit `/water-meter/new` → the "Punto: … • Nº enganche: … • …" line wraps onto multiple full-width lines instead of splitting into narrow vertical columns.
3. Confirm no horizontal scrollbar appears on either page: `document.documentElement.scrollWidth <= window.innerWidth` should be `true` in the console.

- [ ] **Step 5: Commit**

```bash
cd /home/agustin/src/puntodeagua
bun x biome check --write "apps/webapp/src/app/(main)/water-meter"
git add "apps/webapp/src/app/(main)/water-meter/_components/water-meter-list.tsx" \
        "apps/webapp/src/app/(main)/water-meter/new/_components/water-meter-item.tsx"
git commit -m "fix(webapp): restore card spacing and wrap meter metadata on mobile"
```

---

## Task 5: Build the role-aware navigation config

**Why:** Navigation needs a single source of truth that both the bottom bar (Task 6) and the sidebar (Task 7) read from. The existing `src/navigation/sidebar/sidebar-items.ts` is **not** reusable: it targets `/admin/*` routes and contains stale URLs (`/incidents` — the real route is `/incident`; `/admin/water-meters` — no such route). Leave that file alone; it belongs to the admin area.

Two pieces of real logic deserve tests: role filtering (reader-only users must never see a link the middleware will reject) and active-state matching (the `/` entry must match only the home route, not every route).

**Files:**
- Create: `apps/webapp/src/navigation/main-nav-items.ts`
- Test: `apps/webapp/src/navigation/main-nav-items.test.ts`

**Interfaces:**
- Consumes: `isWaterMeterReaderOnly` and `canAccessAdminPanel` from `@/lib/user-roles`.
- Produces:
  ```ts
  export interface MainNavItem {
    title: string
    url: string
    icon: LucideIcon
    /** Shown in the fixed mobile bottom bar. At most 3 items set this. */
    primary?: boolean
  }
  export function getMainNavItems(roles: string[]): MainNavItem[]
  export function isNavItemActive(url: string, pathname: string): boolean
  ```
  Task 6 renders `getMainNavItems(roles).filter((i) => i.primary)`. Task 7 renders the full list.

- [ ] **Step 1: Write the failing test**

Create `apps/webapp/src/navigation/main-nav-items.test.ts`:

```ts
import { describe, expect, it } from 'bun:test'
import { getMainNavItems, isNavItemActive } from './main-nav-items'

describe('getMainNavItems', () => {
  it('gives staff the full set of destinations', () => {
    const urls = getMainNavItems(['MANAGER']).map((item) => item.url)
    expect(urls).toEqual([
      '/',
      '/water-meter/new',
      '/water-meter',
      '/management',
      '/fees',
      '/provider',
      '/incident',
      '/analysis',
      '/export'
    ])
  })

  it('gives reader-only users just the reading flow', () => {
    const urls = getMainNavItems(['WATER_METER_READER']).map((item) => item.url)
    expect(urls).toEqual(['/water-meter/new'])
  })

  it('treats a reader who is also staff as staff', () => {
    const urls = getMainNavItems(['WATER_METER_READER', 'MANAGER']).map((item) => item.url)
    expect(urls).toContain('/management')
  })

  it('exposes the admin panel only to ADMIN', () => {
    expect(getMainNavItems(['ADMIN']).map((i) => i.url)).toContain('/admin')
    expect(getMainNavItems(['COMMUNITY_ADMIN']).map((i) => i.url)).not.toContain('/admin')
  })

  it('marks at most three items as primary for the bottom bar', () => {
    const primary = getMainNavItems(['MANAGER']).filter((item) => item.primary)
    expect(primary.length).toBeLessThanOrEqual(3)
    expect(primary.map((item) => item.url)).toEqual(['/', '/water-meter/new', '/management'])
  })

  it('never offers a reader-only user a route the middleware would reject', () => {
    // Mirrors WATER_METER_READER_ALLOWED_PATHS in lib/water-meter-reader-paths.ts
    const allowed = ['/water-meter/new', '/unauthorized', '/privacy', '/terms']
    for (const item of getMainNavItems(['WATER_METER_READER'])) {
      expect(allowed).toContain(item.url)
    }
  })
})

describe('isNavItemActive', () => {
  it('matches the home route exactly and nothing else', () => {
    expect(isNavItemActive('/', '/')).toBe(true)
    expect(isNavItemActive('/', '/management')).toBe(false)
    expect(isNavItemActive('/', '/water-meter')).toBe(false)
  })

  it('matches a section and its descendants', () => {
    expect(isNavItemActive('/management', '/management')).toBe(true)
    expect(isNavItemActive('/management', '/management/deposits')).toBe(true)
    expect(isNavItemActive('/fees', '/fees/new/abc')).toBe(true)
  })

  it('does not match a different section with a shared prefix', () => {
    expect(isNavItemActive('/water-meter', '/water-meters-report')).toBe(false)
    expect(isNavItemActive('/provider', '/providers')).toBe(false)
  })

  it('prefers the more specific reading route over the meter list', () => {
    expect(isNavItemActive('/water-meter/new', '/water-meter/new')).toBe(true)
    expect(isNavItemActive('/water-meter', '/water-meter/new')).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd /home/agustin/src/puntodeagua && bun test apps/webapp/src/navigation/main-nav-items.test.ts
```

Expected: FAIL — `Cannot find module './main-nav-items'`.

- [ ] **Step 3: Write the implementation**

Create `apps/webapp/src/navigation/main-nav-items.ts`:

```ts
import {
  AlertTriangle,
  Building2,
  Download,
  Droplets,
  FlaskConical,
  Gauge,
  Home,
  type LucideIcon,
  Receipt,
  Settings,
  ShieldUser
} from 'lucide-react'
import { canAccessAdminPanel, isWaterMeterReaderOnly } from '@/lib/user-roles'

export interface MainNavItem {
  title: string
  url: string
  icon: LucideIcon
  /** Shown in the fixed mobile bottom bar. At most 3 items set this. */
  primary?: boolean
}

const READER_ONLY_ITEMS: MainNavItem[] = [
  { title: 'Lecturas', url: '/water-meter/new', icon: Droplets, primary: true }
]

const STAFF_ITEMS: MainNavItem[] = [
  { title: 'Inicio', url: '/', icon: Home, primary: true },
  { title: 'Lecturas', url: '/water-meter/new', icon: Droplets, primary: true },
  { title: 'Contadores', url: '/water-meter', icon: Gauge },
  { title: 'Gestión', url: '/management', icon: Settings, primary: true },
  { title: 'Cobros', url: '/fees', icon: Receipt },
  { title: 'Proveedores', url: '/provider', icon: Building2 },
  { title: 'Incidencias', url: '/incident', icon: AlertTriangle },
  { title: 'Analíticas', url: '/analysis', icon: FlaskConical },
  { title: 'Exportar', url: '/export', icon: Download }
]

const ADMIN_ITEM: MainNavItem = { title: 'Admin', url: '/admin', icon: ShieldUser }

export function getMainNavItems(roles: string[]): MainNavItem[] {
  if (isWaterMeterReaderOnly(roles)) {
    return READER_ONLY_ITEMS
  }

  return canAccessAdminPanel(roles) ? [...STAFF_ITEMS, ADMIN_ITEM] : STAFF_ITEMS
}

export function isNavItemActive(url: string, pathname: string): boolean {
  if (url === '/') {
    return pathname === '/'
  }

  return pathname === url || pathname.startsWith(`${url}/`)
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd /home/agustin/src/puntodeagua && bun test apps/webapp/src/navigation/main-nav-items.test.ts
```

Expected: PASS — 10 pass, 0 fail.

If the first test fails on ordering, the expected URL array in the test is the contract — reorder `STAFF_ITEMS` to match it rather than editing the assertion.

- [ ] **Step 5: Commit**

```bash
cd /home/agustin/src/puntodeagua
bun x biome check --write apps/webapp/src/navigation/main-nav-items.ts apps/webapp/src/navigation/main-nav-items.test.ts
git add apps/webapp/src/navigation/main-nav-items.ts apps/webapp/src/navigation/main-nav-items.test.ts
git commit -m "feat(webapp): add role-aware navigation config for the main app"
```

---

## Task 6: Add the fixed mobile bottom navigation

**Why:** Today every destination is two blind taps into a single hamburger dropdown, with no indication of the current section. A fixed bottom bar gives one-tap access to the three most-used destinations plus persistent "you are here" feedback.

Reader-only users get exactly one destination, so the bar is hidden for them — showing a one-item bar would be noise, and they are already redirected to `/water-meter/new` on login.

**Files:**
- Create: `apps/webapp/src/components/layout/bottom-nav.tsx`
- Modify: `apps/webapp/src/app/(main)/layout.tsx`

**Interfaces:**
- Consumes: `getMainNavItems`, `isNavItemActive`, `type MainNavItem` from `@/navigation/main-nav-items` (Task 5); `useUserStore` from `@/stores/user/user-provider`.
- Produces: `export function BottomNav(): JSX.Element | null`. Takes no props — it reads roles from the user store, exactly like `AccountMenu` does.

- [ ] **Step 1: Create the component**

Create `apps/webapp/src/components/layout/bottom-nav.tsx`:

```tsx
'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getMainNavItems, isNavItemActive } from '@/navigation/main-nav-items'
import { useUserStore } from '@/stores/user/user-provider'

export function BottomNav() {
  const user = useUserStore((state) => state.user)
  const pathname = usePathname()

  if (!user) return null

  const primaryItems = getMainNavItems(user.roles).filter((item) => item.primary)

  // A single destination does not warrant a nav bar (reader-only users).
  if (primaryItems.length < 2) return null

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex items-stretch justify-around">
        {primaryItems.map((item) => {
          const active = isNavItemActive(item.url, pathname)
          return (
            <li key={item.url} className="flex-1">
              <Link
                href={item.url}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-[56px] flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors',
                  active ? 'text-blue-700' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.title}</span>
              </Link>
            </li>
          )
        })}
        <li className="flex-1">
          <button
            type="button"
            aria-label="Abrir menú de navegación"
            onClick={() => {
              document.querySelector<HTMLButtonElement>('[data-account-menu-trigger]')?.click()
            }}
            className="flex min-h-[56px] w-full flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
            <span>Más</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
```

`min-h-[56px]` clears the 44px touch-target minimum with margin. The `env(safe-area-inset-bottom)` padding keeps the bar above the iPhone home indicator.

- [ ] **Step 2: Give the account menu trigger a stable hook**

The "Más" button reuses the existing account dropdown rather than duplicating its contents. In `apps/webapp/src/app/(main)/app/_components/account-menu.tsx`, the trigger button (currently line ~28) needs a marker attribute. It currently reads:

```tsx
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm border border-white/20 hover:bg-white/30 transition-colors"
        >
```

Change to add both the marker and the missing accessible name (the button is icon-only today):

```tsx
        <button
          type="button"
          data-account-menu-trigger
          aria-label="Abrir menú de cuenta"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm border border-white/20 hover:bg-white/30 transition-colors"
        >
```

`h-9 w-9` (36px) → `h-10 w-10` (40px) for the touch target.

- [ ] **Step 3: Fix the hamburger icon contrast**

Still in `account-menu.tsx`, the icon (currently line 33) reads:

```tsx
          <Menu className="h-5 w-5 text-slate-700" />
```

Dark slate on a translucent white pill over a `blue-500 → blue-300` gradient is a weak contrast pairing. Change to:

```tsx
          <Menu className="h-5 w-5 text-white" />
```

- [ ] **Step 4: Mount the bar and reserve space for it**

In `apps/webapp/src/app/(main)/layout.tsx`, add the import:

```tsx
import { BottomNav } from '@/components/layout/bottom-nav'
```

The content wrapper currently reads:

```tsx
              <div className="flex-1 p-4 md:p-6">{children}</div>
              <Footer />
```

Change to reserve room so the fixed bar never covers page content:

```tsx
              <div className="flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</div>
              <Footer />
              <BottomNav />
```

`pb-24` (96px) clears the 56px bar plus the safe-area inset; `md:pb-6` restores normal padding once the bar is hidden.

- [ ] **Step 5: Restore the legal links on mobile**

The bottom bar makes the footer the only place these can live, and they are currently hidden below `sm`. In `apps/webapp/src/components/layout/footer.tsx`, line 10 reads:

```tsx
        <div className="hidden sm:flex gap-4 items-center">
```

Change to:

```tsx
        <div className="flex flex-wrap justify-center gap-4 items-center">
```

Also change the wrapper on line 9 from `justify-center sm:justify-between` to `flex-col gap-2 sm:flex-row sm:justify-between` so the two blocks stack cleanly on narrow screens:

```tsx
      <div className="flex flex-col gap-2 sm:flex-row justify-center sm:justify-between items-center text-sm text-muted-foreground max-w-7xl mx-auto px-6 sm:px-8 md:px-0">
```

- [ ] **Step 6: Verify on mobile**

```bash
cd /home/agustin/src/puntodeagua && bun run webapp
```

In DevTools at 375px, logged in as a staff user:

1. The bottom bar is visible on every `(main)` page with 4 entries: Inicio, Lecturas, Gestión, Más.
2. Navigating to `/management` highlights **Gestión** and not Inicio. Navigating to `/` highlights **Inicio** only. (This is what `isNavItemActive` guards.)
3. Scroll to the bottom of a long page (e.g. `/water-meter`) — the footer and the last list item are fully readable, not hidden behind the bar.
4. Tapping "Más" opens the existing account dropdown.
5. The privacy and terms links are visible in the footer.
6. Resize to 1280px — the bottom bar disappears entirely.

- [ ] **Step 7: Commit**

```bash
cd /home/agustin/src/puntodeagua
bun x biome check --write apps/webapp/src/components/layout "apps/webapp/src/app/(main)/layout.tsx" "apps/webapp/src/app/(main)/app/_components/account-menu.tsx"
git add apps/webapp/src/components/layout/bottom-nav.tsx \
        apps/webapp/src/components/layout/footer.tsx \
        "apps/webapp/src/app/(main)/layout.tsx" \
        "apps/webapp/src/app/(main)/app/_components/account-menu.tsx"
git commit -m "feat(webapp): add fixed mobile bottom navigation

Replaces blind two-tap dropdown navigation with one-tap access to the
three most-used destinations plus persistent active-section feedback.
Also restores the footer legal links on mobile and fixes the account
menu trigger's contrast, touch target and accessible name."
```

---

## Task 7: Add the desktop sidebar

**Why:** `(main)/layout.tsx` already wraps everything in `SidebarProvider` + `SidebarInset` but never renders a `<Sidebar>`, so the provider does nothing. On desktop there is ample room for a persistent nav; the bottom bar is mobile-only by design.

`(main)/app/_components/nav-main.tsx` (240 lines) is dead code — nothing imports it, and it is built around the admin `NavGroup`/sub-item model this app does not need. Delete it rather than adapt it.

**Files:**
- Create: `apps/webapp/src/components/layout/main-sidebar.tsx`
- Delete: `apps/webapp/src/app/(main)/app/_components/nav-main.tsx`
- Modify: `apps/webapp/src/app/(main)/layout.tsx`
- Modify: `apps/webapp/src/components/layout/header.tsx`

**Interfaces:**
- Consumes: `getMainNavItems`, `isNavItemActive` from `@/navigation/main-nav-items` (Task 5); the shadcn `Sidebar*` primitives from `@/components/ui/sidebar`.
- Produces: `export function MainSidebar(): JSX.Element | null`. No props — reads roles from the user store.

- [ ] **Step 1: Confirm the dead code really is dead**

```bash
cd /home/agustin/src/puntodeagua
grep -rn "nav-main\|NavMain" apps/webapp/src --include=*.tsx --include=*.ts | grep -v "app/admin"
```

Expected: only matches **inside** `app/(main)/app/_components/nav-main.tsx` itself (its own definitions). If anything else imports it, stop and report — do not delete.

- [ ] **Step 2: Create the sidebar**

Create `apps/webapp/src/components/layout/main-sidebar.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { APP_CONFIG } from '@/config/app-config'
import { getMainNavItems, isNavItemActive } from '@/navigation/main-nav-items'
import { useUserStore } from '@/stores/user/user-provider'

export function MainSidebar() {
  const user = useUserStore((state) => state.user)
  const pathname = usePathname()

  if (!user) return null

  const items = getMainNavItems(user.roles)

  // Reader-only users have a single destination; a sidebar would be noise.
  if (items.length < 2) return null

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-3 text-sm font-bold tracking-tight group-data-[collapsible=icon]:hidden">
        {APP_CONFIG.name}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isNavItemActive(item.url, pathname)}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
```

- [ ] **Step 3: Mount it in the layout**

In `apps/webapp/src/app/(main)/layout.tsx`, add the import:

```tsx
import { MainSidebar } from '@/components/layout/main-sidebar'
```

The layout currently opens the provider like this:

```tsx
        <SidebarProvider defaultOpen={defaultOpen}>
          <SidebarInset
```

Insert `<MainSidebar />` between them:

```tsx
        <SidebarProvider defaultOpen={defaultOpen}>
          <MainSidebar />
          <SidebarInset
```

The `UserStoreProvider` already wraps `SidebarProvider`, so `useUserStore` resolves correctly inside `MainSidebar`.

- [ ] **Step 4: Add the sidebar toggle to the header**

In `apps/webapp/src/components/layout/header.tsx`, add the import:

```tsx
import { SidebarTrigger } from '@/components/ui/sidebar'
```

The header's left cluster currently opens with:

```tsx
        <div className="flex items-center gap-2 lg:gap-3">
          <a href="/" className="flex items-center gap-2 lg:gap-3">
```

Insert the trigger before the logo link, hidden on mobile where the bottom bar handles navigation:

```tsx
        <div className="flex items-center gap-2 lg:gap-3">
          <SidebarTrigger className="hidden text-white hover:bg-white/20 hover:text-white md:flex" />
          <a href="/" className="flex items-center gap-2 lg:gap-3">
```

`SidebarTrigger` already renders an `<span className="sr-only">Toggle Sidebar</span>`, so it has an accessible name — but that name is English, and screen-reader text counts as user-visible. Pass a Spanish one explicitly rather than editing the shared primitive (`components/ui/sidebar.tsx` is also used by the admin area):

```tsx
<SidebarTrigger
  aria-label="Alternar barra lateral"
  className="hidden text-white hover:bg-white/20 hover:text-white md:flex"
/>
```

`aria-label` on the button overrides the inner `sr-only` span for assistive tech, so no change to the primitive is needed.

- [ ] **Step 5: Delete the dead nav component**

```bash
cd /home/agustin/src/puntodeagua
git rm "apps/webapp/src/app/(main)/app/_components/nav-main.tsx"
```

- [ ] **Step 6: Verify the build and types**

```bash
cd /home/agustin/src/puntodeagua
bun x tsc --noEmit -p apps/webapp/tsconfig.json 2>&1 | grep -vE "^packages/" | head -20
```

Expected: no output (the `packages/**` errors are the pre-existing baseline described in Task 3).

```bash
cd /home/agustin/src/puntodeagua && bun run -F webapp build
```

Expected: build succeeds.

- [ ] **Step 7: Verify on desktop**

```bash
cd /home/agustin/src/puntodeagua && bun run webapp
```

At 1280px, logged in as staff:

1. The sidebar is visible with all nine entries (ten for an ADMIN).
2. The current section is highlighted; visiting `/management/deposits` keeps **Gestión** highlighted.
3. The header toggle collapses the sidebar to icons; tooltips appear on hover; the collapsed state survives a page reload (it is cookie-backed via `SidebarProvider`).
4. No bottom bar is visible.
5. At 375px the sidebar is gone and only the bottom bar shows.

- [ ] **Step 8: Verify reader-only users**

Log in as (or temporarily stub) a user whose only role is `WATER_METER_READER`:

1. No sidebar and no bottom bar render.
2. The account dropdown still offers "Crear lectura" and "Log out".
3. Every rendered nav link resolves to a path `isPathAllowedForWaterMeterReader` accepts — no link bounces to `/unauthorized`.

- [ ] **Step 9: Commit**

```bash
cd /home/agustin/src/puntodeagua
bun x biome check --write apps/webapp/src/components/layout "apps/webapp/src/app/(main)/layout.tsx"
git add apps/webapp/src/components/layout/main-sidebar.tsx \
        apps/webapp/src/components/layout/header.tsx \
        "apps/webapp/src/app/(main)/layout.tsx"
git commit -m "feat(webapp): add desktop sidebar navigation to the main app

Mounts a Sidebar into the SidebarProvider that (main)/layout.tsx already
declared but never used, driven by the shared nav config. Removes the
dead admin-shaped nav-main component."
```

---

## Task 8: Final verification and pull request

**Files:** none modified — this task only verifies and ships.

**Interfaces:** consumes the output of Tasks 1-7.

- [ ] **Step 1: Run the full test suite**

```bash
cd /home/agustin/src/puntodeagua && bun test
```

Expected: all tests pass, including the two new files (`reading-validation.test.ts`, `main-nav-items.test.ts`). Note any pre-existing failures and compare against `main` before assuming this branch caused them.

- [ ] **Step 2: Run lint**

```bash
cd /home/agustin/src/puntodeagua && bun x biome check --max-diagnostics=20000 --diagnostic-level=error .
```

Expected: no errors.

- [ ] **Step 3: Confirm the production build**

```bash
cd /home/agustin/src/puntodeagua && bun run -F webapp build
```

Expected: success.

- [ ] **Step 4: Walk the six fixes end to end**

At 375px and again at 1280px, confirm each original defect is gone:

| # | Check |
|---|---|
| 1 | Future date → error → correct the date → Guardar is enabled and saves. |
| 2 | `/water-meter` cards have visible gaps between them. |
| 3 | `/water-meter/new` metadata wraps to full-width lines; no horizontal scroll. |
| 4 | `<html lang="es">` in the DOM. |
| 5 | Photo input carries `capture="environment"`. |
| 6 | Bottom bar on mobile, sidebar on desktop, correct section highlighted on both. |

- [ ] **Step 5: Open the pull request**

```bash
cd /home/agustin/src/puntodeagua
git push -u origin worktree-frontend-fixes
gh pr create --draft --title "fix(webapp): top 6 frontend defects from review" --body "$(cat <<'EOF'
Fixes the six highest-priority issues from the frontend review.

## Bugs
- **Save button deadlock** in the reading modal — the button was disabled whenever `validationError` was set, but the error only cleared on reading-field changes, so correcting an invalid date left it permanently dead. Validation is now a pure, unit-tested module that runs on submit; the error clears on any field change and renders next to the field it refers to.
- **Missing card spacing** on `/water-meter` — `space-y-2` applies `margin-top`, which CSS ignores on the inline `<a>` that `<Link>` renders. Added `className="block"`.
- **Cramped metadata rows** on mobile — non-wrapping flex rows collapsed into narrow vertical text columns at 375px. Added `flex-wrap`.

## Improvements
- `<html lang="es">` — the UI is entirely Spanish; screen readers were applying English pronunciation.
- `capture="environment"` on all three photo inputs so the rear camera opens directly in the field.
- **Navigation** — `(main)/layout.tsx` declared a `SidebarProvider` but never rendered a `<Sidebar>`, leaving a single hamburger dropdown as the only way to reach any of nine sections, with no active-state feedback. Added a fixed mobile bottom bar (3 primary destinations + "Más") and a collapsible desktop sidebar, both driven by one role-aware config. Deleted the dead 240-line `nav-main.tsx`.

Also folded in, as they sit on the same lines: the account menu trigger gained an `aria-label`, a 40px touch target and readable contrast; the footer's privacy/terms links are no longer hidden on mobile (they were unreachable on the primary device).

## Tests
Two new `bun:test` modules covering the validation rules and the nav role filtering / active matching (17 cases). The remaining changes are markup and were verified manually at 375px and 1280px — this repo has no jsdom or component-test setup and this PR does not add one.

## Out of scope
`Date.now()` in React keys (4 sites), ~200 hardcoded color classes bypassing the theme presets, the duplicated mobile/desktop branches in `add-reading-modal.tsx`, nested `<main>` elements, and doubled container padding. All are documented in the review and left for follow-ups.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review

**Spec coverage** — all six requested fixes map to tasks:

| Review # | Defect | Task |
|---|---|---|
| 1 | Save button deadlock | Task 1 |
| 5 | `lang="es"` | Task 2 |
| 13 | `capture="environment"` | Task 3 |
| 2 | `Link` needs `block` | Task 4 |
| 6 | Metadata row needs `flex-wrap` | Task 4 |
| 11 | Navigation | Tasks 5, 6, 7 |

**Type consistency** — `MainNavItem`, `getMainNavItems`, `isNavItemActive` are defined in Task 5 and consumed with matching signatures in Tasks 6 and 7. `ReadingValidationError` is defined in Task 1 Step 3 and its `.field` / `.message` properties are used consistently in Steps 6-8.

**Scope creep audit** — three changes ride along that were not in the six, each because it sits on a line the plan already edits and leaving it would be conspicuous: the account-menu `aria-label` + touch target + contrast (Task 6 Step 2-3, on the button the "Más" hook attaches to), and the footer legal links (Task 6 Step 5, required because the bottom bar changes what the footer is for). All three are called out in the PR body. Everything else from the review is explicitly deferred in Global Constraints.
