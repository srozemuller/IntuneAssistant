'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Bug, CheckCircle2, RefreshCw } from 'lucide-react';
import { AssignmentsTableSkeleton } from '@/components/AssignmentsTableSkeleton';
import { DataTable } from '@/components/DataTable';
import { ErrorDetailCard } from '@/components/ErrorDetailCard';
import { ExportButton } from '@/components/ExportButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MultiSelect } from '@/components/ui/multi-select';
import { useApiRequest } from '@/hooks/useApiRequest';
import { ERROR_FINDER_APP_FINDINGS_ENDPOINT, ERROR_FINDER_LOOKUP_ENDPOINT, ERROR_FINDER_SCRIPT_FINDINGS_ENDPOINT } from '@/lib/constants';
import { describeRead, findingKey, findingSourceLabel, mergeFindings, type ErrorFinding, type ErrorFindingsResult, type ErrorLookupResult } from '@/lib/errorFinder';

type Envelope<T> = { data: T };
type Row = Record<string, unknown>;

/** One line per part of the scan: still reading, how it was read, or that it failed. */
function PartStatus({ label, part, detail, onRetry }: { label: string; part: ErrorFindingsResult | null | undefined; detail?: string | null; onRetry: () => void }) {
    if (part === undefined) return <div className="flex items-center gap-1.5"><RefreshCw className="h-3 w-3 animate-spin" /> {label}: reading this tenant…</div>;
    if (part === null) {
        return (
            <div role="alert" className="flex items-center gap-2 text-destructive">
                {label} could not be loaded.
                <button type="button" onClick={onRetry} className="underline">Try again</button>
            </div>
        );
    }
    return <div>{label}: {detail}, {describeRead(part)}.</div>;
}

/** Check > Error finder: the errors in this tenant, what they mean and how to fix them. */
export default function ErrorFinderPage() {
    const { request } = useApiRequest();
    const findingsRun = useRef(0);

    // The two parts load apart, so the fast one is on screen while the other still reads. Undefined while loading, null when it failed.
    const [scripts, setScripts] = useState<ErrorFindingsResult | null | undefined>(undefined);
    const [apps, setApps] = useState<ErrorFindingsResult | null | undefined>(undefined);
    const [sources, setSources] = useState<string[]>([]);
    const [openKey, setOpenKey] = useState<string | null>(null);
    // Per code, so a row opens at once the second time. Undefined while loading, null when it failed.
    const [details, setDetails] = useState<Record<string, ErrorLookupResult | null | undefined>>({});

    const load = useCallback((refresh = false) => {
        const run = ++findingsRun.current;
        const suffix = refresh ? '?refresh=true' : '';
        setScripts(undefined);
        setApps(undefined);
        setOpenKey(null);
        setSources([]);
        const read = async (url: string, set: (value: ErrorFindingsResult | null) => void) => {
            const response = await request<Envelope<ErrorFindingsResult>>(url + suffix);
            if (run === findingsRun.current) set(response?.data?.data ?? null);
        };
        read(ERROR_FINDER_SCRIPT_FINDINGS_ENDPOINT, setScripts);
        read(ERROR_FINDER_APP_FINDINGS_ENDPOINT, setApps);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => { load(); }, [load]);

    const toggleFinding = async (finding: ErrorFinding) => {
        const key = findingKey(finding);
        if (openKey === key) { setOpenKey(null); return; }
        setOpenKey(key);
        const code = finding.code;
        if (!code || details[code]) return;
        setDetails(current => ({ ...current, [code]: undefined }));
        const response = await request<Envelope<ErrorLookupResult>>(`${ERROR_FINDER_LOOKUP_ENDPOINT}?code=${encodeURIComponent(code)}`);
        setDetails(current => ({ ...current, [code]: response?.data?.data ?? null }));
    };

    const rows = useMemo(
        () => mergeFindings(scripts, apps).filter(f => sources.length === 0 || sources.includes(f.source)),
        [scripts, apps, sources]);
    const loading = scripts === undefined || apps === undefined;
    const allFindings = (scripts?.findings.length ?? 0) + (apps?.findings.length ?? 0);
    const warnings = [...(scripts?.warnings ?? []), ...(apps?.warnings ?? [])];

    const columns = [
        { key: 'source', label: 'Source', width: 120, render: (value: unknown) => findingSourceLabel(value as ErrorFinding['source']) },
        { key: 'resourceName', label: 'Resource', minWidth: 200 },
        {
            key: 'code', label: 'Code', width: 130,
            render: (value: unknown) => value
                ? <span className="font-mono text-xs text-primary">{String(value)}</span>
                : <span className="text-muted-foreground">No code</span>,
        },
        {
            key: 'matchedTitle', label: 'What it means', minWidth: 300,
            render: (_: unknown, row: Row) => {
                const finding = row as unknown as ErrorFinding;
                if (finding.matched) return finding.matchedTitle;
                return <span className="text-muted-foreground">{finding.code ? 'No entry found yet' : finding.message}</span>;
            },
        },
        { key: 'matchedArea', label: 'Area', width: 120 },
        { key: 'deviceCount', label: 'Devices', width: 90 },
    ];

    const exportColumns = [
        { key: 'source', label: 'Source', getValue: (row: Row) => findingSourceLabel(row.source as ErrorFinding['source']) },
        { key: 'resourceName', label: 'Resource' },
        { key: 'code', label: 'Code' },
        { key: 'matchedTitle', label: 'What it means' },
        { key: 'matchedArea', label: 'Area' },
        { key: 'message', label: 'Message' },
        { key: 'deviceCount', label: 'Devices' },
    ];

    return (
        <div className="container mx-auto py-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Bug className="h-6 w-6" /> Error finder</h1>
                    <p className="text-muted-foreground text-sm mt-1 max-w-3xl">
                        Failed health scripts and app installs in this tenant, with what each error means. Select a row to unfold the cause, the fix and the sources. Nothing is stored, and only error codes go to Error Hunter.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => load(true)} disabled={loading} className="gap-1.5">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    {rows.length > 0 && (
                        <ExportButton variant="outline" data={{
                            data: rows as unknown as Row[],
                            columns: exportColumns,
                            filename: 'error-finder',
                            title: 'Errors found in this tenant',
                        }} />
                    )}
                </div>
            </div>

            <div className="grid gap-1 text-xs text-muted-foreground">
                <PartStatus label="Health scripts" part={scripts} detail={scripts && `${scripts.scriptsScanned} checked`} onRetry={() => load(true)} />
                <PartStatus label="App installs" part={apps} detail={apps && `${apps.appsScanned} assigned checked, ${apps.appsWithFailures} with failed installs`} onRetry={() => load(true)} />
            </div>

            {warnings.map(warning => (
                <div key={warning} role="status" className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400"><AlertTriangle className="h-4 w-4 shrink-0" /> {warning}</div>
            ))}

            {allFindings > 0 && (
                <>
                    <MultiSelect
                        options={[{ value: 'AppInstall', label: 'App install' }, { value: 'HealthScript', label: 'Health script' }]}
                        selected={sources}
                        onChange={setSources}
                        placeholder="All sources"
                        className="max-w-xs"
                    />
                    <DataTable
                        data={rows as unknown as Row[]}
                        columns={columns}
                        showSearch
                        searchPlaceholder="Search resource, code or device"
                        onRowClick={row => toggleFinding(row as unknown as ErrorFinding)}
                        expandedRowRender={row => {
                            const finding = row as unknown as ErrorFinding;
                            if (findingKey(finding) !== openKey) return null;
                            return <ErrorDetailCard finding={finding} details={finding.code ? details[finding.code] : undefined} />;
                        }}
                    />
                </>
            )}

            {allFindings === 0 && loading && <AssignmentsTableSkeleton showStats={false} showFilters={false} tableRows={8} tableColumns={6} />}

            {allFindings === 0 && !loading && scripts && apps && (
                <Card><CardContent className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" /> No failed health scripts or app installs found.
                </CardContent></Card>
            )}
        </div>
    );
}
