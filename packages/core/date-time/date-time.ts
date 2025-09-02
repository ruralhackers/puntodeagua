import { DateTime as LuxonDateTime } from "luxon";
import type { DurationUnits } from "./duration-units";

export class DateTime {
	private luxonDateTime: LuxonDateTime;

	private constructor(date: string, locale?: string) {
		this.luxonDateTime = LuxonDateTime.fromISO(date as string, {
			locale: locale,
		});
	}

	/**
	 *
	 * @param date to compare
	 * @param format  unit to compare
	 * @returns absolute diff between dates in the given unit
	 */
	diff(date: DateTime, format: DurationUnits): number {
		const diff = this.luxonDateTime.diff(date.luxonDateTime, format).toObject()[
			format
		] as number;

		return Math.abs(diff);
	}

	format(format: string, options?: { locale: string }): string {
		return this.luxonDateTime.toFormat(format, options);
	}

	toDate(): Date {
		return this.luxonDateTime.toJSDate();
	}

	/**
	 *
	 * @returns ISO string in UTC
	 */
	toISO(): string {
		return this.luxonDateTime.toUTC().toISO() as string;
	}

	toMillis(): number {
		return this.luxonDateTime.toMillis();
	}

	static fromNow(options?: { plusSeconds?: number }): DateTime {
		const { plusSeconds } = options ?? { plusSeconds: 0 };
		return new DateTime(
			LuxonDateTime.now().plus({ second: plusSeconds }).toISO() as string,
		);
	}

	static fromISO(iso: string): DateTime {
		return new DateTime(iso);
	}

	static fromDate(date: Date): DateTime {
		return new DateTime(date.toISOString());
	}
}
