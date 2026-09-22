// Recursively collects searchable string values, descending into nested objects
// and arrays (e.g. a setting's childSettingInfo -> children -> children...) instead
// of stringifying them as "[object Object]".
function collectSearchableValues(value: unknown, out: string[]): void {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
        for (const item of value) collectSearchableValues(item, out);
        return;
    }
    if (typeof value === 'object') {
        for (const nested of Object.values(value as Record<string, unknown>)) {
            collectSearchableValues(nested, out);
        }
        return;
    }
    out.push(String(value).toLowerCase());
}

// Space-separated tokens; a token prefixed with "!" (e.g. "!windows") excludes
// rows matching that term instead of requiring it. Shared by DataTable's own
// search box and callers that need to export exactly what's currently displayed.
export function filterRowsBySearchTerm<T extends Record<string, unknown>>(
    rows: T[],
    searchTerm: string,
    excludeKeys?: string[]
): T[] {
    if (!searchTerm.trim()) return rows;

    const tokens = searchTerm
        .trim()
        .split(/\s+/)
        .map(token => {
            const negated = token.startsWith('!') && token.length > 1;
            return { term: (negated ? token.slice(1) : token).toLowerCase(), negated };
        });

    const excluded = excludeKeys?.length ? new Set(excludeKeys) : null;

    return rows.filter(row => {
        // Search through ALL properties in the row, including nested objects/arrays,
        // not just the top-level column keys — except any top-level key explicitly
        // excluded (e.g. related/contextual records that shouldn't make an otherwise
        // unrelated row match a search term).
        const values: string[] = [];
        for (const [key, value] of Object.entries(row)) {
            if (excluded?.has(key)) continue;
            collectSearchableValues(value, values);
        }

        return tokens.every(({ term, negated }) => {
            const matches = values.some(value => value.includes(term));
            return negated ? !matches : matches;
        });
    });
}
