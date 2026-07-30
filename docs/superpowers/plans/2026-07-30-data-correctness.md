# Data-Correctness Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate two pre-existing data-corruption bugs — a Spanish number parser that turns `1234.5` into `12345`, and `toISOString()` producing the wrong calendar day in local time across 17 sites.

**Architecture:** Two new pure modules under `apps/webapp/src/lib/` (`spanish-number.ts`, `local-date.ts`), each with colocated `bun:test` files. The number ambiguity is removed at the input rather than guessed at in the parser: a new `normalizeDecimalInput` converts a typed `.` to `,` so an input's value only ever contains digits and at most one comma. `use-spanish-number-parser.ts` becomes a thin wrapper over the pure module so its two consumers keep their call sites.

**Tech Stack:** TypeScript, `date-fns` (already the repo's dominant date library), `bun:test`, Biome 2.2.2.

**Design spec:** `docs/superpowers/specs/2026-07-30-data-correctness-design.md`

## Global Constraints

- **UI language is Spanish** for user-visible strings. Code identifiers and comments stay English.
- **Test runner is `bun:test`.** Import from `'bun:test'`. No jsdom, no React Testing Library — **do not add them**, no component tests. `bun test` already runs in CI.
- **No new dependencies.** `date-fns` is already in `apps/webapp/package.json`.
- **Biome 2.2.2 on the exact files you changed, never a directory** — a directory run reformats unrelated files in this repo. After running it, `git diff --stat` and confirm only your files appear.
- **`git add` explicit file paths only.** Never `git add -A`.
- **Infrastructure is out of bounds:** `next.config.js`, any `package.json`, `bun.lock`, `src/server/db.ts`, `packages/database/**`.
- **Do not touch `apps/webapp/src/app/admin/**`.**
- **Leave the 4 PDF-filename `toISOString()` sites alone** — an off-by-one in a filename is harmless and they are explicitly out of scope.
- **Out of scope entirely:** the failing production build (an admin file imports an undeclared `@radix-ui/react-dropdown-menu`), `Date.now()` in React keys, hardcoded colour classes, duplicated mobile/desktop branches, backfilling already-stored readings.

---

## File Structure

**New files:**

| File | Responsibility |
|---|---|
| `apps/webapp/src/lib/spanish-number.ts` | Pure Spanish number parsing/formatting/input normalisation. |
| `apps/webapp/src/lib/spanish-number.test.ts` | `bun:test` contract + idempotency + round-trip tests. |
| `apps/webapp/src/lib/local-date.ts` | Local-timezone `YYYY-MM-DD` formatting via date-fns. |
| `apps/webapp/src/lib/local-date.test.ts` | `bun:test` incl. a real timezone regression test. |

**Modified files:**

| File | Change |
|---|---|
| `apps/webapp/src/hooks/use-spanish-number-parser.ts` | Becomes a thin wrapper re-exporting the pure functions. |
| `apps/webapp/src/app/(main)/water-meter/new/_components/add-reading-modal.tsx` | `handleReadingChange` uses `normalizeDecimalInput`; date default uses `todayLocalDateString`. |
| `apps/webapp/src/app/(main)/water-meter/[id]/_components/edit-reading-modal.tsx` | Both reading inputs normalise; form seeded with `formatForInput`. |
| 9 further files | Replace `toISOString()` date values — full table in Task 4. |

---

## Task 1: The pure Spanish-number module

**Files:**
- Create: `apps/webapp/src/lib/spanish-number.ts`
- Test: `apps/webapp/src/lib/spanish-number.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  ```ts
  export function parseSpanishNumber(value: string): number
  export function formatToSpanish(value: number): string      // grouped, display: 1234 -> "1.234,00"
  export function formatForInput(value: number): string       // ungrouped, input: 1234 -> "1234,00"
  export function normalizeDecimalInput(value: string): string
  ```

- [ ] **Step 1: Write the failing test**

Create `apps/webapp/src/lib/spanish-number.test.ts`:

```ts
import { describe, expect, it } from 'bun:test'
import {
  formatForInput,
  formatToSpanish,
  normalizeDecimalInput,
  parseSpanishNumber
} from './spanish-number'

describe('parseSpanishNumber', () => {
  it('parses plain integers', () => {
    expect(parseSpanishNumber('1234')).toBe(1234)
  })

  it('treats the comma as the decimal separator', () => {
    expect(parseSpanishNumber('1234,56')).toBe(1234.56)
    expect(parseSpanishNumber('0,5')).toBe(0.5)
    expect(parseSpanishNumber(',5')).toBe(0.5)
  })

  it('treats dots as thousands separators', () => {
    expect(parseSpanishNumber('1.234,56')).toBe(1234.56)
    expect(parseSpanishNumber('1.234.567,89')).toBe(1234567.89)
    expect(parseSpanishNumber('1.234')).toBe(1234)
  })

  it('returns 0 for empty or non-numeric input', () => {
    expect(parseSpanishNumber('')).toBe(0)
    expect(parseSpanishNumber('   ')).toBe(0)
    expect(parseSpanishNumber('abc')).toBe(0)
  })
})

describe('normalizeDecimalInput', () => {
  it('converts a typed dot into the decimal comma', () => {
    // This is the 10x-corruption bug: "1234.5" used to parse as 12345.
    expect(normalizeDecimalInput('1234.5')).toBe('1234,5')
  })

  it('leaves an already-normal value untouched', () => {
    expect(normalizeDecimalInput('1234,5')).toBe('1234,5')
    expect(normalizeDecimalInput('1234,00')).toBe('1234,00')
  })

  it('keeps only the first separator', () => {
    expect(normalizeDecimalInput('1,2,3')).toBe('1,23')
    expect(normalizeDecimalInput('12.34.5')).toBe('12,345')
  })

  it('strips non-numeric characters', () => {
    expect(normalizeDecimalInput('abc12')).toBe('12')
    expect(normalizeDecimalInput('')).toBe('')
  })

  it('keeps a leading separator', () => {
    expect(normalizeDecimalInput(',5')).toBe(',5')
    expect(normalizeDecimalInput('.5')).toBe(',5')
  })

  it('is idempotent', () => {
    for (const raw of ['1234.5', '1234,5', '1,2,3', '12.34.5', 'abc12', ',5', '.5', '', '1234,00']) {
      const once = normalizeDecimalInput(raw)
      expect(normalizeDecimalInput(once)).toBe(once)
    }
  })

  it('only ever emits digits and at most one comma', () => {
    for (const raw of ['1.234,56', 'a1b2.3c,4', '...,,,', '9']) {
      const out = normalizeDecimalInput(raw)
      expect(out).toMatch(/^[0-9]*,?[0-9]*$/)
    }
  })
})

describe('formatForInput', () => {
  it('formats without thousands grouping', () => {
    expect(formatForInput(1234)).toBe('1234,00')
    expect(formatForInput(1234.56)).toBe('1234,56')
    expect(formatForInput(0)).toBe('0,00')
  })

  it('produces a value normalizeDecimalInput leaves untouched', () => {
    for (const v of [0, 5, 1234, 1234.56, 1234567.89]) {
      const seeded = formatForInput(v)
      expect(normalizeDecimalInput(seeded)).toBe(seeded)
    }
  })
})

describe('formatToSpanish', () => {
  it('groups thousands for display', () => {
    expect(formatToSpanish(1234)).toBe('1.234,00')
    expect(formatToSpanish(1234.56)).toBe('1.234,56')
  })
})

describe('round trips', () => {
  it('survives the input format', () => {
    for (const v of [0, 0.5, 5, 1234, 1234.56, 1234567.89]) {
      expect(parseSpanishNumber(formatForInput(v))).toBe(v)
    }
  })

  it('survives the display format', () => {
    for (const v of [0, 0.5, 5, 1234, 1234.56, 1234567.89]) {
      expect(parseSpanishNumber(formatToSpanish(v))).toBe(v)
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd /home/agustin/src/puntodeagua/.claude/worktrees/data-correctness
bun test apps/webapp/src/lib/spanish-number.test.ts
```

Expected: FAIL — `Cannot find module './spanish-number'`.

- [ ] **Step 3: Write the implementation**

Create `apps/webapp/src/lib/spanish-number.ts`:

```ts
/**
 * Spanish number handling.
 *
 * In Spanish notation the comma is the decimal separator and the dot groups
 * thousands. A raw text input cannot distinguish a user typing "1234.5"
 * (meaning 1234,5) from the thousands form "1.234" — so the ambiguity is
 * removed at the keystroke by normalizeDecimalInput rather than guessed at
 * here. Every input guarded by it holds only digits and at most one comma.
 */

/** Converts a Spanish-formatted number string to a JS number. */
export function parseSpanishNumber(value: string): number {
  if (!value || value.trim() === '') return 0

  const withoutThousands = value.trim().replace(/\./g, '')
  const normalized = withoutThousands.replace(',', '.')
  const parsed = Number.parseFloat(normalized)

  return Number.isNaN(parsed) ? 0 : parsed
}

/** Formats a number for display, grouped: 1234 -> "1.234,00" */
export function formatToSpanish(value: number): string {
  return value.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Formats a number to seed a text input, ungrouped: 1234 -> "1234,00".
 * Never contains a dot, so normalizeDecimalInput is idempotent over it.
 */
export function formatForInput(value: number): string {
  return value.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false
  })
}

/**
 * Normalises a reading input as the user types. The first separator typed —
 * dot or comma — becomes the decimal comma; every later separator and any
 * non-digit is dropped. Output is always /^[0-9]*,?[0-9]*$/ and applying this
 * twice changes nothing.
 */
export function normalizeDecimalInput(value: string): string {
  let hasSeparator = false
  let result = ''

  for (const char of value) {
    if (char >= '0' && char <= '9') {
      result += char
    } else if ((char === '.' || char === ',') && !hasSeparator) {
      hasSeparator = true
      result += ','
    }
  }

  return result
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd /home/agustin/src/puntodeagua/.claude/worktrees/data-correctness
bun test apps/webapp/src/lib/spanish-number.test.ts
```

Expected: PASS, 0 fail.

- [ ] **Step 5: Commit**

```bash
cd /home/agustin/src/puntodeagua/.claude/worktrees/data-correctness
bun x biome check --write apps/webapp/src/lib/spanish-number.ts apps/webapp/src/lib/spanish-number.test.ts
git add apps/webapp/src/lib/spanish-number.ts apps/webapp/src/lib/spanish-number.test.ts
git commit -m "feat(webapp): add pure Spanish number module with input normalisation"
```

---

## Task 2: The local-date module

**Files:**
- Create: `apps/webapp/src/lib/local-date.ts`
- Test: `apps/webapp/src/lib/local-date.test.ts`

**Interfaces:**
- Consumes: `format` from `date-fns` (already a dependency).
- Produces:
  ```ts
  export function toLocalDateString(date: Date): string
  export function todayLocalDateString(): string
  ```

**Verified fact:** setting `process.env.TZ = 'Europe/Madrid'` at the top of a bun test file does change `Date` behaviour (`new Date(2026, 6, 30, 0, 30).getTimezoneOffset()` → `-120`, and its `toISOString()` yields `2026-07-29`). That makes a real regression test possible rather than a merely contractual one.

- [ ] **Step 1: Write the failing test**

Create `apps/webapp/src/lib/local-date.test.ts`. The `process.env.TZ` assignment must come before the import so the module is evaluated under the fixed zone:

```ts
process.env.TZ = 'Europe/Madrid'

import { describe, expect, it } from 'bun:test'
import { toLocalDateString, todayLocalDateString } from './local-date'

describe('toLocalDateString', () => {
  it('returns the local calendar day, not the UTC one', () => {
    // 00:30 local on 30 July in Madrid (UTC+2) is still 29 July in UTC.
    // The old `toISOString().split('T')[0]` returned the 29th — that was the bug.
    const justAfterLocalMidnight = new Date(2026, 6, 30, 0, 30)

    expect(justAfterLocalMidnight.toISOString().split('T')[0]).toBe('2026-07-29')
    expect(toLocalDateString(justAfterLocalMidnight)).toBe('2026-07-30')
  })

  it('agrees with UTC during the middle of the day', () => {
    expect(toLocalDateString(new Date(2026, 6, 30, 12, 0))).toBe('2026-07-30')
  })

  it('handles a winter date, when Madrid is UTC+1', () => {
    const justAfterLocalMidnight = new Date(2026, 0, 15, 0, 30)

    expect(justAfterLocalMidnight.toISOString().split('T')[0]).toBe('2026-01-14')
    expect(toLocalDateString(justAfterLocalMidnight)).toBe('2026-01-15')
  })

  it('zero-pads month and day', () => {
    expect(toLocalDateString(new Date(2026, 0, 5, 9, 0))).toBe('2026-01-05')
  })
})

describe('todayLocalDateString', () => {
  it('matches toLocalDateString for now', () => {
    expect(todayLocalDateString()).toBe(toLocalDateString(new Date()))
  })

  it('is a valid YYYY-MM-DD string', () => {
    expect(todayLocalDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd /home/agustin/src/puntodeagua/.claude/worktrees/data-correctness
bun test apps/webapp/src/lib/local-date.test.ts
```

Expected: FAIL — `Cannot find module './local-date'`.

If instead the two `toISOString()` assertions fail, `process.env.TZ` is not taking effect in your environment. Do not delete those assertions to make it green — report it, and fall back to running the suite with `TZ=Europe/Madrid bun test`.

- [ ] **Step 3: Write the implementation**

Create `apps/webapp/src/lib/local-date.ts`:

```ts
import { format } from 'date-fns'

/**
 * Formats a Date as YYYY-MM-DD in the runtime's local timezone.
 *
 * Replaces `toISOString().split('T')[0]`, which returns the UTC day: in Spain
 * (UTC+1/+2) that is still yesterday between local midnight and 01:00/02:00,
 * so a reading taken then was stored a day early.
 */
export function toLocalDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** Today as YYYY-MM-DD in local time. */
export function todayLocalDateString(): string {
  return toLocalDateString(new Date())
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd /home/agustin/src/puntodeagua/.claude/worktrees/data-correctness
bun test apps/webapp/src/lib/local-date.test.ts
```

Expected: PASS, 0 fail.

- [ ] **Step 5: Commit**

```bash
cd /home/agustin/src/puntodeagua/.claude/worktrees/data-correctness
bun x biome check --write apps/webapp/src/lib/local-date.ts apps/webapp/src/lib/local-date.test.ts
git add apps/webapp/src/lib/local-date.ts apps/webapp/src/lib/local-date.test.ts
git commit -m "feat(webapp): add local-timezone date formatting module"
```

---

## Task 3: Rewire the reading inputs

**Files:**
- Modify: `apps/webapp/src/hooks/use-spanish-number-parser.ts`
- Modify: `apps/webapp/src/app/(main)/water-meter/new/_components/add-reading-modal.tsx`
- Modify: `apps/webapp/src/app/(main)/water-meter/[id]/_components/edit-reading-modal.tsx`

**Interfaces:**
- Consumes: everything from Task 1.
- Produces: nothing new. The hook keeps returning `{ parseSpanishNumber, formatToSpanish }` and gains `formatForInput` and `normalizeDecimalInput`, so existing destructuring keeps working.

- [ ] **Step 1: Make the hook a thin wrapper**

Replace the whole body of `apps/webapp/src/hooks/use-spanish-number-parser.ts` with:

```ts
import {
  formatForInput,
  formatToSpanish,
  normalizeDecimalInput,
  parseSpanishNumber
} from '@/lib/spanish-number'

/**
 * Thin wrapper over `@/lib/spanish-number` so existing components keep their
 * call sites. Prefer importing from the lib directly in new code — the
 * functions are pure and need no hook.
 */
export function useSpanishNumberParser() {
  return { parseSpanishNumber, formatToSpanish, formatForInput, normalizeDecimalInput }
}
```

- [ ] **Step 2: Normalise the add-reading input**

In `add-reading-modal.tsx`, pull `normalizeDecimalInput` out of the hook where `parseSpanishNumber` is already destructured (currently line ~71):

```ts
  const { parseSpanishNumber, normalizeDecimalInput } = useSpanishNumberParser()
```

`handleReadingChange` currently reads:

```ts
  const handleReadingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Allow only: digits, comma (one only), dots, and empty string
    const validPattern = /^[0-9]*[.,]?[0-9]*$/

    if (validPattern.test(value) || value === '') {
      setReadingForm((prev) => ({ ...prev, reading: value }))
      setValidationError(null)
    }
  }
```

Replace it with:

```ts
  const handleReadingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Normalising rather than gating: a typed "." becomes the decimal comma,
    // so "1234.5" can no longer be stored as 12345.
    setReadingForm((prev) => ({ ...prev, reading: normalizeDecimalInput(e.target.value) }))
    setValidationError(null)
  }
```

- [ ] **Step 3: Normalise both edit-reading inputs and seed the form ungrouped**

In `edit-reading-modal.tsx`:

Change the destructure (currently line ~56) from `formatToSpanish` to the two functions now needed:

```ts
  const { parseSpanishNumber, formatForInput, normalizeDecimalInput } = useSpanishNumberParser()
```

Change the form seed (currently line ~74) from:

```ts
      reading: formatToSpanish(parseFloat(reading.reading)),
```

to:

```ts
      reading: formatForInput(Number.parseFloat(reading.reading)),
```

The modal renders its whole form twice, so there are **two** reading `<Input>` elements (around lines 190 and 283), each spreading react-hook-form's `field` with no filtering. For **each** of them, override `onChange` after the `{...field}` spread so the spread does not clobber it:

```tsx
                          <Input
                            placeholder="Ingresa la nueva lectura"
                            {...field}
                            onChange={(e) => field.onChange(normalizeDecimalInput(e.target.value))}
                            disabled={updateReadingMutation.isPending}
```

Keep every other prop exactly as it is, and keep `inputMode`/`type` unchanged if present. Verify by grep that **both** inputs got the override.

- [ ] **Step 4: Verify**

```bash
cd /home/agustin/src/puntodeagua/.claude/worktrees/data-correctness
grep -c "normalizeDecimalInput" "apps/webapp/src/app/(main)/water-meter/[id]/_components/edit-reading-modal.tsx"
```
Expected: `3` (one destructure + two `onChange` overrides).

```bash
grep -n "formatToSpanish" "apps/webapp/src/app/(main)/water-meter/[id]/_components/edit-reading-modal.tsx"
```
Expected: no output — the display-grouped formatter is no longer used here.

```bash
bun test
bun x tsc --noEmit -p apps/webapp/tsconfig.json 2>&1 | grep -E "spanish-number|local-date|add-reading-modal|edit-reading-modal|use-spanish"
```
Expected: suite passes; no tsc output for those files.

- [ ] **Step 5: Commit**

```bash
cd /home/agustin/src/puntodeagua/.claude/worktrees/data-correctness
bun x biome check --write apps/webapp/src/hooks/use-spanish-number-parser.ts \
  "apps/webapp/src/app/(main)/water-meter/new/_components/add-reading-modal.tsx" \
  "apps/webapp/src/app/(main)/water-meter/[id]/_components/edit-reading-modal.tsx"
git add apps/webapp/src/hooks/use-spanish-number-parser.ts \
  "apps/webapp/src/app/(main)/water-meter/new/_components/add-reading-modal.tsx" \
  "apps/webapp/src/app/(main)/water-meter/[id]/_components/edit-reading-modal.tsx"
git commit -m "fix(webapp): stop a typed decimal point multiplying readings by ten"
```

---

## Task 4: Replace the 17 UTC date sites

**Files — 17 date-value sites across 10 files.** Replace `new Date().toISOString().split('T')[0]` with `todayLocalDateString()`, and `<someDate>.toISOString().split('T')[0]` / `.slice(0, 10)` with `toLocalDateString(<someDate>)`. Import from `@/lib/local-date`.

| File | Lines |
|---|---|
| `apps/webapp/src/hooks/use-analysis-form.ts` | 24, 93 |
| `apps/webapp/src/app/(main)/fees/_components/fee-payment-form.tsx` | 154 (`.slice(0, 10)`) |
| `apps/webapp/src/app/(main)/management/meter-replacement/_components/meter-replacement-form.tsx` | 120, 134 |
| `apps/webapp/src/app/(main)/analysis/new/page.tsx` | 204 (`max=`) |
| `apps/webapp/src/app/(main)/water-meter/new/_components/add-reading-modal.tsx` | 36 (inside `getCurrentDateString`) |
| `apps/webapp/src/app/(main)/export/readings/page.tsx` | 71, 72 |
| `apps/webapp/src/app/(main)/export/readings/results/page.tsx` | 57, 58 |
| `apps/webapp/src/app/(main)/export/incidents/page.tsx` | 31, 32 |
| `apps/webapp/src/app/(main)/export/incidents/results/page.tsx` | 53, 54 |
| `apps/webapp/src/app/(main)/export/analysis/dates/page.tsx` | 29, 30 |

**Do NOT touch these 4 filename sites** — an off-by-one in a PDF filename is harmless:
`export/_hooks/use-readings-pdf-generator.ts` (61, 62), `use-analysis-pdf-generator.ts` (66), `use-incidents-pdf-generator.ts` (61).

**Interfaces:**
- Consumes: `toLocalDateString`, `todayLocalDateString` from Task 2.

- [ ] **Step 1: Simplify `getCurrentDateString` in the reading modal**

`add-reading-modal.tsx` line ~34 defines:

```ts
function getCurrentDateString(): string {
  return new Date().toISOString().split('T')[0] ?? ''
}
```

Replace the body with `return todayLocalDateString()` and add the import. Keep the function — it is called in three places (the form default and the two `max` attributes), so keeping it avoids touching those call sites.

- [ ] **Step 2: Replace the remaining 16 sites**

Work file by file. In each, add the import and swap the expression. The two shapes are:

```ts
// before
analyzedAt: new Date().toISOString().split('T')[0],
// after
analyzedAt: todayLocalDateString(),
```

```ts
// before
setEndDate(today.toISOString().split('T')[0] || '')
// after
setEndDate(toLocalDateString(today))
```

Note the `|| ''` and `?? ''` fallbacks exist only because `split('T')[0]` is typed `string | undefined`. `toLocalDateString` returns `string`, so drop the fallback rather than leaving dead code.

`fee-payment-form.tsx:154` uses the other shape:

```ts
// before
return date.toISOString().slice(0, 10)
// after
return toLocalDateString(date)
```

- [ ] **Step 3: Verify no date-value site remains**

```bash
cd /home/agustin/src/puntodeagua/.claude/worktrees/data-correctness
grep -rn "toISOString()" apps/webapp/src --include=*.tsx --include=*.ts
```

Expected: exactly **4** matches, all of them the PDF-filename sites listed above. Any other match is a site you missed.

```bash
bun test
bun x tsc --noEmit -p apps/webapp/tsconfig.json 2>&1 | grep -vE "^packages/" > /tmp/after.txt
git stash push -u -m "data-correctness-tsc-baseline-probe"
bun x tsc --noEmit -p apps/webapp/tsconfig.json 2>&1 | grep -vE "^packages/" > /tmp/before.txt
git stash list --format='%H %gs' | head -1
```
Then restore with `git stash apply <sha>` (not pop) and drop the entry by re-finding it by tag. Compare `/tmp/before.txt` and `/tmp/after.txt` — the counts must match, proving no new type errors.

If stashing feels risky, an equivalent check is to run tsc and confirm none of the reported files are ones you edited.

- [ ] **Step 4: Commit**

```bash
cd /home/agustin/src/puntodeagua/.claude/worktrees/data-correctness
bun x biome check --write <the 10 files you edited>
git add <the 10 files you edited>
git commit -m "fix(webapp): use local calendar day instead of the UTC day

toISOString() returns the UTC date, which in Spain (UTC+1/+2) is still
yesterday between local midnight and 01:00/02:00. Default form dates,
date-input max attributes and export ranges were all a day early for
anyone using the app then."
```

---

## Task 5: Final verification and pull request

**Files:** none modified.

- [ ] **Step 1: Full suite**

```bash
cd /home/agustin/src/puntodeagua/.claude/worktrees/data-correctness
bun test
```
Expected: all pass. The baseline before this work was 311 pass / 0 fail; the new lib tests add to that.

- [ ] **Step 2: Lint**

```bash
bun x biome check --max-diagnostics=20000 --diagnostic-level=error .
```
Expected: 0 errors (the repo was clean at the branch point).

- [ ] **Step 3: Confirm scope**

```bash
git diff --name-only worktree-frontend-fixes..HEAD
```
Expected: only the 4 new lib files, the hook, the 10 edited files, and the two docs. No `package.json`, no `bun.lock`, no `packages/database/**`, nothing under `app/admin/`.

- [ ] **Step 4: Open the PR, stacked on PR #7**

```bash
git push -u origin data-correctness
gh pr create --draft --base worktree-frontend-fixes --head data-correctness \
  --title "fix(webapp): correct Spanish decimal parsing and UTC date handling" \
  --body-file <a file you write covering: the two bugs with concrete before/after values, the
              input-normalisation decision and why it beats a parser heuristic, the three
              behaviour changes users will notice, and the explicit note that historical
              data is NOT migrated>
```

Base is `worktree-frontend-fixes`, not `main`, so the PR shows only this work. Retarget to `main` once #7 merges.

---

## Self-Review

**Spec coverage:** the design's two bugs map to Tasks 1+3 (number) and Tasks 2+4 (dates); the `formatForInput` decision is implemented in Task 1 Step 3 and consumed in Task 3 Step 3; the testing section's idempotency and round-trip requirements are in Task 1 Step 1; the timezone regression test is Task 2 Step 1.

**Type consistency:** `parseSpanishNumber`, `formatToSpanish`, `formatForInput`, `normalizeDecimalInput` are declared in Task 1 and consumed with identical names in Task 3. `toLocalDateString`/`todayLocalDateString` are declared in Task 2 and consumed in Task 4.

**Known behaviour changes**, all called out in the design and to be repeated in the PR body: default dates shift by up to a day for late-night users; typing `.` now renders `,`; the edit modal gains input filtering it never had.
