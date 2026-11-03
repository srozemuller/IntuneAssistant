/** What the API answers for the error finder (#43). */
export interface ErrorSource { title: string; url: string; author?: string | null }

export interface ErrorEntry {
    code: string;
    decimal?: string | null;
    symbol?: string | null;
    area: string;
    title: string;
    meaning: string;
    cause: string;
    resolution: string;
    sources: ErrorSource[];
    origin: 'catalog' | 'errorhunter';
    confidence?: string | null;
    lastReviewed?: string | null;
}

export interface ErrorLookupResult {
    input: string;
    code: string;
    decimal: string;
    signed: number;
    found: boolean;
    catalog: ErrorEntry | null;
    live: ErrorEntry | null;
    liveStatus: string;
    message?: string | null;
    decodeUrl?: string | null;
}

export interface ErrorFinding {
    source: 'HealthScript' | 'AppInstall';
    resourceId: string;
    resourceName: string;
    code: string | null;
    message: string | null;
    deviceCount: number;
    devices: { deviceName: string; userPrincipalName?: string | null }[];
    matched: boolean;
    matchedTitle: string | null;
    matchedArea?: string | null;
    matchedOrigin?: 'catalog' | 'errorhunter' | null;
}

export interface ErrorFindingsResult {
    findings: ErrorFinding[];
    scriptsScanned: number;
    appsWithFailures: number;
    appsScanned: number;
    warnings: string[];
    generatedAt: string;
    durationMs: number;
    fromCache: boolean;
}

/** The live answer wins because it is the newest text; the catalogue is the fallback when ErrorHunter cannot answer. */
export function pickEntry(result: ErrorLookupResult): ErrorEntry | null {
    return result.live ?? result.catalog;
}

/** Every source that says something about this code, once. */
export function mergeSources(result: ErrorLookupResult): ErrorSource[] {
    const all = [...(result.live?.sources ?? []), ...(result.catalog?.sources ?? [])];
    return all.filter((source, index) => all.findIndex(other => other.url === source.url) === index);
}

/** What to tell the admin when the live source did not answer. Null when there is nothing to say. */
export function liveStatusNote(status: string): string | null {
    switch (status) {
        case 'rateLimited': return 'Error Hunter is busy, so only the Intune Assistant catalogue was used. Try again in a minute.';
        case 'unavailable': return 'Error Hunter did not answer, so only the Intune Assistant catalogue was used.';
        case 'notConfigured': return 'The live Error Hunter lookup is off on this environment, so only the Intune Assistant catalogue was used.';
        default: return null;
    }
}

export function findingSourceLabel(source: ErrorFinding['source']): string {
    return source === 'AppInstall' ? 'App install' : 'Health script';
}

/** One finding is one error on one resource. */
export function findingKey(finding: ErrorFinding): string {
    return `${finding.source}|${finding.resourceId}|${finding.code ?? finding.message ?? ''}`;
}

/** Plain text to paste in a ticket. */
export function buildErrorSummary(result: ErrorLookupResult): string {
    const entry = pickEntry(result);
    if (!entry) return result.code;
    return [
        `${result.code} (${result.decimal}): ${entry.title}`,
        `What it means: ${entry.meaning}`,
        `Likely cause: ${entry.cause}`,
        `How to fix: ${entry.resolution}`,
        `Sources: ${mergeSources(result).map(source => source.url).join(' ')}`,
    ].join('\n');
}

/** Both parts of the scan in one list, worst first. A part still loading or failed adds nothing. */
export function mergeFindings(...parts: (ErrorFindingsResult | null | undefined)[]): ErrorFinding[] {
    return parts.flatMap(part => part?.findings ?? []).sort((a, b) => b.deviceCount - a.deviceCount || a.resourceName.localeCompare(b.resourceName));
}

/** How a part got its answer, so the wait can be judged. */
export function describeRead(part: ErrorFindingsResult): string {
    const seconds = `${Math.max(1, Math.round(part.durationMs / 1000))} s`;
    return part.fromCache ? `from memory, read ${new Date(part.generatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}` : `read in ${seconds}`;
}
