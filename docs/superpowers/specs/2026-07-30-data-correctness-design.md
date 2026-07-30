# Data-Correctness Fixes — Design

**Date:** 2026-07-30
**Status:** approved
**Branch:** `data-correctness`, stacked on `worktree-frontend-fixes` (PR #7)

## Problem

Two pre-existing bugs corrupt data that the application treats as authoritative. Both were found while reviewing PR #7 and deliberately left out of it.

### Bug 1 — Spanish number parsing loses the decimal point (10× corruption)

`apps/webapp/src/hooks/use-spanish-number-parser.ts` strips **every** dot as a thousands separator before parsing:

```ts
const withoutThousands = cleaned.replace(/\./g, '')
const normalized = withoutThousands.replace(',', '.')
```

Verified current behaviour:

| Input | Current result | Intended |
|---|---|---|
| `"1.234,56"` | `1234.56` | ✅ correct |
| `"1234,56"` | `1234.56` | ✅ correct |
| `"1234.5"` | **`12345`** | ❌ should be `1234.5` |
| `".5"` | **`5`** | ❌ should be `0.5` |
| `"1.234"` | `1234` | ambiguous — see decision below |

A field worker typing `1234.5` records `12345` litres. The value flows into `addWaterMeterReading` and becomes the meter's stored reading, so it corrupts consumption calculations and any billing derived from them.

The input in `add-reading-modal.tsx:171` permits exactly one separator (`/^[0-9]*[.,]?[0-9]*$/`), so a typed `.` cannot be a thousands separator there. The input in `edit-reading-modal.tsx` has **no** filter at all — it spreads react-hook-form's `field` directly (at two places, lines ~190 and ~283, because the modal renders its whole form twice), so it currently accepts arbitrary text.

### Bug 2 — `toISOString()` produces the wrong calendar day in local time

`toISOString()` converts to UTC. Spain is UTC+1 (UTC+2 in summer), so between local midnight and 01:00/02:00 the UTC date is still *yesterday*. Consequences:

- `add-reading-modal.tsx:36` — a reading taken at 00:30 defaults to yesterday, **and** the `max` attribute forbids selecting today.
- `analysis/new/page.tsx:204` — same `max` problem for water-analysis records.
- `use-analysis-form.ts`, `meter-replacement-form.tsx`, `fee-payment-form.tsx` — default dates land a day early.
- Six export date-range pages — default ranges shift by a day.

17 sites produce date **values**. A further 4 sites use the same call only to stamp a PDF **filename**, where the off-by-one is harmless.

## Decisions

### Decision 1 — Remove the number ambiguity at the input, not in the parser

In Spanish notation `.` is the thousands separator, so `1.234` legitimately means 1234 — but a user typing `1234.5` means 1234,5. No parser can reliably distinguish intent after the fact.

Three approaches were considered:

- **A — parser heuristic:** if a comma is present it wins; otherwise a lone dot followed by exactly 3 digits is a thousands separator, else a decimal separator. Rejected: it guesses, and produces surprising neighbours (`1.234` → 1234 but `1.23` → 1.23).
- **B — normalise at the input (chosen):** typing `.` inserts `,`. The parser then treats comma as the only decimal separator and dots strictly as thousands, with no special cases.
- **C — one separator always means decimal:** rejected, silently breaks `1.234` = 1234.

**B was chosen initially, then reversed during implementation. A is what shipped.**

Option B normalised the separator as the user typed. Review of the implementation showed this
trades one silent corruption for a worse one — it commits to an interpretation before the number
is finished, so a Spanish user typing the grouped form loses a factor of 1000:

| typed | before this work | under option B | correct |
|---|---|---|---|
| `12.345` | 12345 ✅ | **12,345** ❌ | 12345 |
| `1234.5` | **12345** ❌ | 1234,5 ✅ | 1234,5 |
| `1.234` | 1234 ✅ | **1,234** ❌ | 1234 |
| `12.34` | **1234** ❌ | 12,34 ✅ | 12,34 |

Option B is right for two of the four shapes and wrong for the other two — a lateral move, with a
larger failure magnitude (1000× under-report rather than 10× over-report). Worse, the under-report
is the one the server cannot catch: editing the *previous* of two readings only has to stay below
the last one, so a 1000×-low value passes validation and inflates computed consumption.

**Option A shipped instead.** `parseSpanishNumber` disambiguates at parse time, once the number is
complete: a dot followed by exactly three digits (and not in leading position) groups thousands,
anything else is a decimal point. This is the standard locale heuristic and it is correct for all
four shapes above, plus `1.234.567` → 1234567, `.5` → 0.5 and `1.2345` → 1.2345. It is still a
heuristic — `1.234` meaning one-point-two-three-four is unreachable — but a meter reading of 1.234
litres is not a real case, whereas 1234 is.

`normalizeDecimalInput` remains, reduced to a character filter (digits, dots, at most one comma).
It no longer rewrites the separator. Its value is that `edit-reading-modal` gains input filtering
it never had.

### Decision 2 — Use date-fns for local dates

`date-fns` is already the repository's dominant date library (7 import sites vs 2 for dayjs) and `format(date, 'yyyy-MM-dd')` is local-time by definition. No new dependency.

## Architecture

Two new pure modules under `apps/webapp/src/lib/`, each with a colocated `bun:test` file — matching the existing convention (`user-roles.ts` / `user-roles.test.ts`).

```
apps/webapp/src/lib/
  spanish-number.ts        parseSpanishNumber, formatToSpanish, normalizeDecimalInput
  spanish-number.test.ts
  local-date.ts            toLocalDateString, todayLocalDateString
  local-date.test.ts

apps/webapp/src/hooks/use-spanish-number-parser.ts
  → re-exports the pure functions, same hook signature, so consumers are unchanged
```

Keeping the hook as a thin wrapper means `add-reading-modal.tsx` and `edit-reading-modal.tsx` keep their current `useSpanishNumberParser()` call sites; only the input `onChange` behaviour changes.

### `lib/spanish-number.ts`

```ts
/** Converts a Spanish-formatted number string to a JS number.
 *  Comma is the decimal separator; dots are thousands separators. */
export function parseSpanishNumber(value: string): number

/** Formats a number for DISPLAY, grouped, always 2 decimals: 12345 -> "12.345,00" */
export function formatToSpanish(value: number): string

/** Formats a number to seed a text INPUT: ungrouped, always 2 decimals:
 *  12345 -> "12345,00". Never contains a dot, so normalizeDecimalInput is
 *  idempotent over it. */
export function formatForInput(value: number): string

/** Normalises a raw input string as the user types: converts "." to ",",
 *  keeps at most one comma, and strips anything that is not a digit or comma. */
export function normalizeDecimalInput(value: string): string
```

**Why `formatForInput` exists.** Two reasons, both about not corrupting the value the edit modal resubmits.

First, precision. `reading` is `Decimal(10, 3)` in the schema, but the previous seed used `maximumFractionDigits: 2`. The edit modal always sends `reading`, even when the user only changed a note or a photo — so a stored `1234.567` was seeded as `"1234,57"` and written back as `1234.57`, losing the third decimal silently. `formatForInput` uses three.

Second, shape. Seeding ungrouped keeps the field free of thousands dots, so the value the user sees is the value the parser reads back with no heuristic involved.

Note on the grouping threshold: Intl's `es-ES` locale sets `minimumGroupingDigits: 2`, so four-digit integers are *not* grouped (`1234` → `"1234,00"`) while five-digit ones are (`12345` → `"12.345,00"`). Meter readings in litres routinely exceed five digits, so the hazard is real rather than theoretical: seeding an input with `"12.345,00"` and normalising one keystroke yields `12.345` instead of `12345`. This is pinned by a test.

`formatToSpanish` is retained unchanged for read-only display; `edit-reading-modal.tsx:74` switches to `formatForInput`. That is its only call site today, so the change is contained.

`parseSpanishNumber` contract — the parser becomes strict, because `normalizeDecimalInput` guarantees its input shape:

| Input | Result | Note |
|---|---|---|
| `""` / whitespace | `0` | unchanged from today |
| `"1234"` | `1234` | |
| `"1234,56"` | `1234.56` | |
| `"1.234,56"` | `1234.56` | dots are thousands |
| `"1.234.567,89"` | `1234567.89` | |
| `"0,5"` | `0.5` | |
| `",5"` | `0.5` | leading comma |
| `"1.234"` | `1234` | no comma → dots are thousands (Spanish convention) |
| `"abc"` | `0` | unchanged from today |

Note the `"1.234"` row: with `normalizeDecimalInput` guarding both inputs and `formatForInput` seeding them, a dot can no longer reach the parser from a form. `parseSpanishNumber` still handles grouped strings so it stays correct for any non-input caller and for values produced by `formatToSpanish`.

`normalizeDecimalInput` contract — the guarantee is that its output contains **only digits and at most one comma**, and that applying it twice changes nothing:

| Input | Result | Note |
|---|---|---|
| `"1234.5"` | `"1234,5"` | the fix: dot becomes the decimal comma |
| `"1234,5"` | `"1234,5"` | already normal |
| `"1,2,3"` | `"1,23"` | only the first comma survives |
| `"12.34.5"` | `"12,345"` | first separator wins, the rest are dropped |
| `"abc12"` | `"12"` | non-numeric stripped |
| `",5"` | `",5"` | leading comma kept; parser reads it as 0.5 |
| `""` | `""` | |
| `"1234,00"` | `"1234,00"` | **idempotent** — this is what `formatForInput` seeds |

### `lib/local-date.ts`

```ts
/** Formats a Date as YYYY-MM-DD in the runtime's local timezone.
 *  Replaces `toISOString().split('T')[0]`, which returns the UTC day. */
export function toLocalDateString(date: Date): string

/** Today as YYYY-MM-DD in local time. */
export function todayLocalDateString(): string
```

Both wrap `date-fns`' `format(date, 'yyyy-MM-dd')`.

## Call sites to change

**17 date-value sites** — replace `toISOString().split('T')[0]` / `.slice(0, 10)`:

| File | Lines |
|---|---|
| `hooks/use-analysis-form.ts` | 24, 93 |
| `app/(main)/fees/_components/fee-payment-form.tsx` | 154 |
| `app/(main)/management/meter-replacement/_components/meter-replacement-form.tsx` | 120, 134 |
| `app/(main)/analysis/new/page.tsx` | 204 (`max=`) |
| `app/(main)/water-meter/new/_components/add-reading-modal.tsx` | 36 |
| `app/(main)/export/readings/page.tsx` | 71, 72 |
| `app/(main)/export/readings/results/page.tsx` | 57, 58 |
| `app/(main)/export/incidents/page.tsx` | 31, 32 |
| `app/(main)/export/incidents/results/page.tsx` | 53, 54 |
| `app/(main)/export/analysis/dates/page.tsx` | 29, 30 |

**4 filename sites — deliberately unchanged** (an off-by-one in a PDF filename is harmless):
`export/_hooks/use-readings-pdf-generator.ts` (61, 62), `use-analysis-pdf-generator.ts` (66), `use-incidents-pdf-generator.ts` (61).

**Reading inputs** — apply `normalizeDecimalInput`:
- `add-reading-modal.tsx` — in `handleReadingChange`, replacing the existing regex gate.
- `edit-reading-modal.tsx` — both input instances (~190 and ~283, the modal renders its form twice); currently unfiltered.
- `edit-reading-modal.tsx:74` — seed the form with `formatForInput` instead of `formatToSpanish`, so the field starts ungrouped and normalisation stays idempotent.

## Testing

`bun:test` only, on the pure modules. No jsdom, no React Testing Library — this repo has neither and this work does not add them. `bun test` already runs in CI.

- `spanish-number.test.ts` — every row of both contract tables above, plus:
  - `normalizeDecimalInput` is **idempotent**: `n(n(x)) === n(x)` for every case in its table.
  - Round-trip: `parseSpanishNumber(formatForInput(v)) === v` for representative values, which is the property that actually protects the stored reading.
  - Round-trip through the display format too: `parseSpanishNumber(formatToSpanish(v)) === v`, covering the grouped path.
- `local-date.test.ts` — the timezone-sensitive case is the point of the change, so test it explicitly by constructing a local `Date` just after midnight and asserting the returned day matches the *local* calendar day, not the UTC one. Use a fixed local date (e.g. `new Date(2026, 6, 30, 0, 30)`) rather than `Date.now()`, so the test is deterministic.

## Risks and behaviour changes

- **Dates shift by up to one day** for anyone using the app between local midnight and 01:00/02:00. That is the fix, but it changes default export ranges and default form dates. Worth stating in the PR.
- **Typing `.` now produces `,`.** Visible change in the two reading inputs. Intended, and consistent with the displayed format.
- **`edit-reading-modal` gains input filtering it never had.** Previously arbitrary text was accepted and silently parsed to `0`; now non-numeric characters are rejected as typed. This is a behaviour change, but strictly an improvement.
- **No historical data is migrated.** Readings already stored wrong stay wrong. Detecting them reliably is not possible from the value alone, so it is out of scope; flag it to the maintainers separately.

## Out of scope

- The failing production build (`components/data-table/data-table-view-options.tsx` imports an undeclared `@radix-ui/react-dropdown-menu`). Touching `package.json`/`bun.lock` is a separate concern.
- Deferred UI items from the PR #7 review: `Date.now()` in React keys, ~200 hardcoded colour classes, the duplicated mobile/desktop branches in the reading modals, nested `<main>`, doubled container padding.
- Backfilling or correcting already-stored readings.
