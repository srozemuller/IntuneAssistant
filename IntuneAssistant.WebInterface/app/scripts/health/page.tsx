'use client';

import React, { useState, useMemo } from 'react';
import { useMsal } from '@azure/msal-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/DataTable';
import { CancelledCard } from '@/components/CancelledCard';
import { useApiRequest } from '@/hooks/useApiRequest';
import { HEALTH_SCRIPTS_ENDPOINT } from '@/lib/constants';
import {
    RefreshCw, XCircle, Database, AlertCircle, FileCode2,
    Info, ChevronDown, ChevronUp, CheckCircle, Braces, MonitorCheck,
} from 'lucide-react';

interface HealthScript extends Record<string, unknown> {
    id: string;
    displayName: string;
    description?: string;
    lastModifiedDateTime?: string;
    publisher?: string;
}

interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}

const columns = [
    { key: 'displayName', label: 'Name', sortable: true, searchable: true },
    { key: 'publisher', label: 'Publisher', sortable: true, searchable: true },
    {
        key: 'description',
        label: 'Description',
        sortable: false,
        searchable: true,
        render: (value: unknown) => (
            <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {String(value ?? '—')}
            </span>
        ),
    },
    {
        key: 'lastModifiedDateTime',
        label: 'Last Modified',
        sortable: true,
        render: (value: unknown) =>
            value ? new Date(value as string).toLocaleString() : '—',
    },
];

export default function HealthScriptsPage() {
    const { accounts } = useMsal();
    const router = useRouter();
    const { request, cancel } = useApiRequest();

    const [scripts, setScripts] = useState<HealthScript[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCancelled, setIsCancelled] = useState(false);
    const [infoExpanded, setInfoExpanded] = useState(false);

    const fetchScripts = async () => {
        if (!accounts.length) return;

        setLoading(true);
        setError(null);
        setIsCancelled(false);

        try {
            const response = await request<ApiResponse<HealthScript[]>>(HEALTH_SCRIPTS_ENDPOINT);
            if (response?.data?.data) {
                setScripts(response.data.data);
            } else {
                setScripts([]);
            }
        } catch (err) {
            console.error('Failed to fetch health scripts:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch health scripts');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        cancel();
        setScripts([]);
        setError(null);
        setLoading(false);
        setIsCancelled(true);
    };

    const tableData = useMemo(
        () => scripts.map(s => ({ ...s })),
        [scripts]
    );

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Health Scripts
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        View Intune remediation (health) scripts and their device run-state reports
                    </p>
                </div>
                <div className="flex gap-2">
                    {scripts.length > 0 ? (
                        <Button onClick={fetchScripts} variant="outline" size="sm" disabled={loading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    ) : (
                        <>
                            <Button onClick={fetchScripts} disabled={loading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Load Scripts
                            </Button>
                            {loading && (
                                <Button onClick={handleCancel} variant="destructive" size="sm">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── Intro / explainer card ── always visible ──────────────── */}
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/20">
                <CardContent className="pt-4 pb-4">
                    <button
                        type="button"
                        onClick={() => setInfoExpanded(v => !v)}
                        className="w-full flex items-start gap-3 text-left"
                    >
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                                What are Health Scripts and how does the report work?
                            </span>
                            {!infoExpanded && (
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                                    Intune remediation scripts can output structured data — click to learn how this report picks it up.
                                </p>
                            )}
                        </div>
                        {infoExpanded
                            ? <ChevronUp className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                            : <ChevronDown className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        }
                    </button>

                    {infoExpanded && (
                        <div className="mt-4 pl-8 space-y-4 border-t border-blue-200 dark:border-blue-800/60 pt-4">

                            {/* What are health scripts */}
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <MonitorCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                    <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                                        What are Intune Remediation (Health) Scripts?
                                    </span>
                                </div>
                                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                    Remediation scripts (also called health scripts or proactive remediations) are PowerShell script pairs
                                    deployed by Microsoft Intune to Windows managed devices. Each pair consists of a <strong>detection script</strong> — which
                                    checks a condition and exits with code <code className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 rounded">0</code> (compliant) or <code className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 rounded">1</code> (non-compliant)
                                    — and a <strong>remediation script</strong> that runs automatically when the detection fails. They
                                    are commonly used for enforcing registry keys, cleaning up stale data, fixing configuration drift, or
                                    collecting device health information.
                                </p>
                            </div>

                            {/* JSON output */}
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <Braces className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                    <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                                        Detection scripts can output structured JSON data
                                    </span>
                                </div>
                                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                    The detection script can write data to standard output using <code className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 rounded">Write-Output</code> in
                                    PowerShell. When that output is <strong>valid JSON</strong>, Intune stores it as structured pre-remediation
                                    detection output. This is a powerful pattern for inventory collection — you can have a script report
                                    installed applications, browser extensions, registry values, hardware information, or any other device
                                    data back through Intune without writing to a separate SIEM or logging solution.
                                </p>
                                <div className="mt-2 rounded border border-blue-200 dark:border-blue-700 bg-blue-100/60 dark:bg-blue-900/30 p-3 font-mono text-xs text-blue-900 dark:text-blue-100">
                                    <div className="text-blue-500 dark:text-blue-400 mb-1"># Example detection script output</div>
                                    <div>{'$extensions = Get-InstalledBrowserExtensions'}</div>
                                    <div>{'Write-Output ($extensions | ConvertTo-Json -Compress)'}</div>
                                    <div>{'exit 0'}</div>
                                </div>
                            </div>

                            {/* How the report works */}
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                    <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                                        How this report picks up that data
                                    </span>
                                </div>
                                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                    Click any script name to open its <strong>Device Run-State Report</strong>. The report fetches the
                                    latest run state for every device the script has been deployed to and automatically parses the JSON
                                    output into dynamic columns — one column per JSON key found in any device&apos;s output. The output
                                    must be a JSON array or object returned by the detection script&apos;s <code className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 rounded">Write-Output</code>.
                                    If the output is not valid JSON, or the script has not run yet, the row will show no output columns.
                                </p>
                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-blue-700 dark:text-blue-300">
                                    <div className="flex items-center gap-1.5">
                                        <Badge variant="outline" className="text-xs border-blue-300 dark:border-blue-600 bg-blue-100/60 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 py-0">Script Output tab</Badge>
                                        <span>One row per JSON output item — data-first view</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Badge variant="outline" className="text-xs border-blue-300 dark:border-blue-600 bg-blue-100/60 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 py-0">Device Overview tab</Badge>
                                        <span>One row per device — expand to see full output inline</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Error */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">Error: {error}</span>
                        </div>
                        <Button onClick={fetchScripts} className="mt-4" variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Cancelled */}
            {isCancelled && !loading && (
                <CancelledCard
                    onRetry={() => { setIsCancelled(false); fetchScripts(); }}
                    title="Loading Cancelled"
                    description="Health scripts loading was cancelled. Click below to load again."
                    buttonText="Load Scripts"
                />
            )}

            {/* Empty / welcome state */}
            {scripts.length === 0 && !loading && !error && !isCancelled && (
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <FileCode2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-4">
                                Ready to view health scripts
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Load all Intune remediation scripts to browse and view their device run-state reports
                            </p>
                            <Button onClick={fetchScripts} size="lg">
                                <Database className="h-5 w-5 mr-2" />
                                Load Scripts
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Loading spinner */}
            {loading && scripts.length === 0 && (
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-6">
                        <div className="text-center py-16">
                            <RefreshCw className="h-12 w-12 mx-auto text-yellow-400 animate-spin mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Loading Health Scripts
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Fetching scripts from Intune…
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Data table */}
            {scripts.length > 0 && (
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Health Scripts</span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                {scripts.length} script{scripts.length !== 1 ? 's' : ''}
                            </span>
                        </CardTitle>
                        <CardDescription>
                            Click a row to open the device run-state report for that script
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <DataTable
                            data={tableData}
                            columns={columns}
                            searchPlaceholder="Search scripts…"
                            onRowClick={(row) => {
                                if (row.id) {
                                    router.push(`/scripts/health/${row.id}/report`);
                                }
                            }}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
