export type D1Boolean = 0 | 1 | boolean | null | undefined;

export function uniqueNumbers(values: number[]): number[] {
	return [...new Set(values)];
}

export function buildInPlaceholders(values: unknown[]): string {
	return values.map(() => "?").join(",");
}

export function mapById<T extends { id: number }>(items: T[]): Map<number, T> {
	const mapped = new Map<number, T>();

	for (const item of items) {
		mapped.set(item.id, item);
	}

	return mapped;
}

export function toBoolean(value: D1Boolean): boolean {
	return value === true || value === 1;
}

export function toNullableBoolean(value: D1Boolean): boolean | null {
	if (value === null || value === undefined) {
		return null;
	}

	return toBoolean(value);
}

export function fromBoolean(value: boolean): 0 | 1 {
	return value ? 1 : 0;
}

export function groupByNumberKey<T>(
	items: T[],
	getKey: (item: T) => number,
): Map<number, T[]> {
	const grouped = new Map<number, T[]>();

	for (const item of items) {
		const key = getKey(item);
		const current = grouped.get(key) ?? [];

		current.push(item);
		grouped.set(key, current);
	}

	return grouped;
}