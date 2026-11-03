'use client';
import React, { useState } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildErrorSummary, mergeSources, liveStatusNote, pickEntry, type ErrorFinding, type ErrorLookupResult } from '@/lib/errorFinder';

/** Copies a value and confirms it in place: the app has no toast notifications. */
function useCopied() {
    const [copied, setCopied] = useState<string | null>(null);
    const copy = async (key: string, value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(key);
            window.setTimeout(() => setCopied(current => (current === key ? null : current)), 1500);
        } catch {
            setCopied(null);
        }
    };
    return { copied, copy };
}

function CopyIcon({ done }: { done: boolean }) {
    return done ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />;
}

function CodeChip({ label, value, copied, onCopy }: { label: string; value: string; copied: boolean; onCopy: () => void }) {
    return (
        <button
            type="button"
            onClick={onCopy}
            aria-label={`Copy ${label} ${value}`}
            className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2 text-left hover:bg-muted min-w-0"
        >
            <span className="flex items-baseline gap-2 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0">{label}</span>
                <span className="font-mono text-xs truncate">{value}</span>
            </span>
            <span className="text-muted-foreground shrink-0"><CopyIcon done={copied} /></span>
        </button>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{title}</h4>
            <p className="text-sm leading-relaxed text-foreground/85">{children}</p>
        </section>
    );
}

function Devices({ finding }: { finding: ErrorFinding }) {
    return (
        <section>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Devices in this tenant {finding.deviceCount > finding.devices.length ? `(first ${finding.devices.length} of ${finding.deviceCount})` : `(${finding.deviceCount})`}
            </h4>
            <ul className="grid gap-x-6 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-3 text-xs text-foreground/85">
                {finding.devices.map(device => (
                    <li key={`${device.deviceName}-${device.userPrincipalName ?? ''}`} className="truncate">
                        {device.deviceName || 'Unknown device'}{device.userPrincipalName ? ` · ${device.userPrincipalName}` : ''}
                    </li>
                ))}
            </ul>
        </section>
    );
}

/** Everything known about one error, shown in place under its row. `details` is undefined while it loads and null when it failed. */
export function ErrorDetailCard({ finding, details }: { finding: ErrorFinding; details: ErrorLookupResult | null | undefined }) {
    const { copied, copy } = useCopied();
    const entry = details ? pickEntry(details) : null;
    const note = details ? liveStatusNote(details.liveStatus) : null;
    const sources = details ? mergeSources(details) : [];
    const learn = sources.find(source => source.url.includes('learn.microsoft.com'));
    const others = sources.filter(source => source !== learn);
    const errorHunter = entry ? sources.find(source => source.url.includes('errorhunter.msnugget.com')) : undefined;
    const reviewed = details?.catalog?.lastReviewed ? new Date(details.catalog.lastReviewed).toLocaleDateString() : null;

    return (
        <div className="m-2 rounded-2xl border bg-card p-5 sm:p-6 space-y-5 cursor-default" onClick={event => event.stopPropagation()}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-2xl font-bold break-all">{finding.code ?? 'No error code'}</span>
                    {finding.code && (
                        <button type="button" onClick={() => copy('code', finding.code!)} aria-label="Copy error code" className="text-muted-foreground hover:text-foreground">
                            <CopyIcon done={copied === 'code'} />
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {entry && <Badge variant="secondary" className="rounded-full">{entry.area}</Badge>}
                    {details && entry && (
                        <Badge variant="outline" className="rounded-full border-green-600/40 text-green-700 dark:text-green-400">
                            {details.catalog ? 'In catalogue' : 'From Error Hunter'}
                        </Badge>
                    )}
                </div>
            </div>

            {finding.code && details === undefined && (
                <div className="space-y-3 animate-pulse" aria-label="Loading error details">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map(i => <div key={i} className="h-9 rounded-lg bg-muted" />)}</div>
                    <div className="h-6 w-2/3 rounded bg-muted" />
                    <div className="h-16 rounded bg-muted" />
                </div>
            )}
            {finding.code && details === null && <div role="alert" className="text-sm text-destructive">The details of this error could not be loaded.</div>}

            {details && (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <CodeChip label="Hex" value={details.code} copied={copied === 'hex'} onCopy={() => copy('hex', details.code)} />
                    <CodeChip label="Unsigned" value={details.decimal} copied={copied === 'unsigned'} onCopy={() => copy('unsigned', details.decimal)} />
                    <CodeChip label="Signed" value={String(details.signed)} copied={copied === 'signed'} onCopy={() => copy('signed', String(details.signed))} />
                    {entry?.symbol && <CodeChip label="Symbol" value={entry.symbol} copied={copied === 'symbol'} onCopy={() => copy('symbol', entry.symbol!)} />}
                </div>
            )}

            {entry && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold leading-snug">{entry.title}</h3>
                    <Section title="What it means">{entry.meaning}</Section>
                    <Section title="Likely cause">{entry.cause}</Section>
                    <Section title="How to fix">{entry.resolution}</Section>
                </div>
            )}
            {errorHunter && (
                <p className="text-xs text-muted-foreground">
                    Information from{' '}
                    <a href={errorHunter.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">Error Hunter</a>
                    , an independent Intune error code reference.
                </p>
            )}
            {details && !entry && <p className="text-sm">{details.message}</p>}
            {note && <p className="text-sm text-muted-foreground">{note}</p>}
            {finding.message && <Section title="Reported by the script">{finding.message}</Section>}

            <Devices finding={finding} />

            {details && (
                <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                    {learn && (
                        <Button asChild className="rounded-full gap-1.5">
                            <a href={learn.url} target="_blank" rel="noopener noreferrer">Open Microsoft Learn <ArrowUpRight className="h-4 w-4" /></a>
                        </Button>
                    )}
                    {!learn && details.decodeUrl && (
                        <Button asChild className="rounded-full gap-1.5">
                            <a href={details.decodeUrl} target="_blank" rel="noopener noreferrer">Search Microsoft Learn <ArrowUpRight className="h-4 w-4" /></a>
                        </Button>
                    )}
                    {others.map(source => (
                        <Button key={source.url} asChild variant="outline" className="rounded-full gap-1.5">
                            <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} <ArrowUpRight className="h-4 w-4" /></a>
                        </Button>
                    ))}
                    {learn && (
                        <Button type="button" variant="outline" className="rounded-full" onClick={() => copy('link', learn.url)}>
                            {copied === 'link' ? 'Copied' : 'Copy link'}
                        </Button>
                    )}
                    {entry && (
                        <Button type="button" variant="outline" className="rounded-full" onClick={() => copy('summary', buildErrorSummary(details))}>
                            {copied === 'summary' ? 'Copied' : 'Copy summary'}
                        </Button>
                    )}
                    {details.catalog && (
                        <span className="text-xs text-muted-foreground ml-auto">{reviewed ? `Last reviewed ${reviewed}` : 'Not yet reviewed by Intune Assistant'}</span>
                    )}
                </div>
            )}
        </div>
    );
}
