'use client';

import React, { useState, useCallback } from 'react';
import {
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    Copy,
    Download,
    ExternalLink,
    Check,
    Code2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ── Type exported so the settings page and other consumers can reference it ───

export interface OmaCatalogMigrationInfo {
    /** Human-readable advisory message */
    message: string;
    /** e.g. "device_vendor_msft_policy_config_desktopappinstaller_enableappinstaller" */
    catalogSettingId: string;
    /** e.g. "Enable App Installer" */
    catalogDisplayName: string;
    catalogDescription: string | null;
    /** e.g. "/Config/DesktopAppInstaller/EnableAppInstaller" */
    offsetUri: string;
    keywords: string[] | null;
    /** GET this URL to retrieve all available option IDs for the setting */
    catalogDefinitionUrl: string;
    /** Ready-to-POST JSON body for the configurationPolicies API */
    migrationPolicyJson: string;
}

interface OmaMigrationBannerProps {
    info: OmaCatalogMigrationInfo;
    settingName?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OmaMigrationBanner({ info }: OmaMigrationBannerProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isJsonExpanded, setIsJsonExpanded] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = useCallback((text: string, fieldKey: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(fieldKey);
            setTimeout(() => setCopiedField(null), 2000);
        }).catch(() => {
            // Fallback for environments where clipboard API is unavailable
            try {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            } catch { /* ignore */ }
            setCopiedField(fieldKey);
            setTimeout(() => setCopiedField(null), 2000);
        });
    }, []);

    const formattedJson = (() => {
        try { return JSON.stringify(JSON.parse(info.migrationPolicyJson), null, 2); }
        catch { return info.migrationPolicyJson; }
    })();

    const downloadJson = useCallback(() => {
        const blob = new Blob([formattedJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const safeName = info.catalogDisplayName
            .replace(/[^a-zA-Z0-9_\- ]/g, '')
            .trim()
            .replace(/\s+/g, '_') || 'migration-policy';
        a.href = url;
        a.download = `${safeName}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [formattedJson, info.catalogDisplayName]);


    // ── Reusable copy indicator ───────────────────────────────────────────────

    function CopyIndicator({ fieldKey, className = '' }: { fieldKey: string; className?: string }) {
        return copiedField === fieldKey ? (
            <>
                <Check className={`h-3 w-3 text-green-600 ${className}`} />
                <span className="text-xs text-green-600">Copied!</span>
            </>
        ) : (
            <Copy className={`h-3 w-3 ${className}`} />
        );
    }

    return (
        <div className="w-full border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/20">

            {/* ── Always-visible collapsed header ── */}
            <button
                type="button"
                onClick={() => setIsExpanded(v => !v)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-amber-100/70 dark:hover:bg-amber-900/20 transition-colors"
                aria-expanded={isExpanded}
            >
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                        Settings Catalog equivalent available
                    </span>
                    {!isExpanded && (
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5 truncate">
                            {info.message}
                        </p>
                    )}
                </div>
                {isExpanded
                    ? <ChevronDown className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    : <ChevronRight className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                }
            </button>

            {/* ── Expanded detail section ── */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-amber-200 dark:border-amber-800/50">

                    {/* Advisory message */}
                    <p className="text-xs text-amber-700 dark:text-amber-300 pt-3 italic">{info.message}</p>

                    {/* Detail rows */}
                    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-xs items-center">

                        {/* Catalog setting display name */}
                        <dt className="font-semibold text-amber-800 dark:text-amber-200 whitespace-nowrap">
                            Catalog setting
                        </dt>
                        <dd className="font-semibold text-amber-900 dark:text-amber-100">
                            {info.catalogDisplayName}
                        </dd>

                        {/* Description (optional) */}
                        {info.catalogDescription && (
                            <>
                                <dt className="font-semibold text-amber-800 dark:text-amber-200 whitespace-nowrap">
                                    Description
                                </dt>
                                <dd className="text-amber-700 dark:text-amber-300">
                                    {info.catalogDescription}
                                </dd>
                            </>
                        )}

                        {/* Catalog setting ID + copy */}
                        <dt className="font-semibold text-amber-800 dark:text-amber-200 whitespace-nowrap">
                            Setting ID
                        </dt>
                        <dd className="flex items-center gap-2 min-w-0">
                            <code className="font-mono text-amber-900 dark:text-amber-100 truncate flex-1 text-xs">
                                {info.catalogSettingId}
                            </code>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); copyToClipboard(info.catalogSettingId, 'settingId'); }}
                                className="shrink-0 flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
                                title="Copy Setting ID"
                            >
                                <CopyIndicator fieldKey="settingId" />
                            </button>
                        </dd>

                        {/* Offset URI + copy */}
                        <dt className="font-semibold text-amber-800 dark:text-amber-200 whitespace-nowrap">
                            Offset URI
                        </dt>
                        <dd className="flex items-center gap-2 min-w-0">
                            <code className="font-mono text-amber-900 dark:text-amber-100 truncate flex-1 text-xs">
                                {info.offsetUri}
                            </code>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); copyToClipboard(info.offsetUri, 'offsetUri'); }}
                                className="shrink-0 flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
                                title="Copy Offset URI"
                            >
                                <CopyIndicator fieldKey="offsetUri" />
                            </button>
                        </dd>

                        {/* Keywords (optional) */}
                        {info.keywords && info.keywords.length > 0 && (
                            <>
                                <dt className="font-semibold text-amber-800 dark:text-amber-200 whitespace-nowrap self-start pt-0.5">
                                    Keywords
                                </dt>
                                <dd className="flex flex-wrap gap-1">
                                    {info.keywords.map((kw, i) => (
                                        <Badge
                                            key={i}
                                            variant="outline"
                                            className="text-xs border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-900/30 py-0"
                                        >
                                            {kw}
                                        </Badge>
                                    ))}
                                </dd>
                            </>
                        )}
                    </dl>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2">
                        <a
                            href={info.catalogDefinitionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            View catalog definition
                        </a>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(info.migrationPolicyJson, 'json'); }}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                        >
                            {copiedField === 'json' ? (
                                <><Check className="h-3.5 w-3.5 text-green-600" /><span className="text-green-600">Copied!</span></>
                            ) : (
                                <><Copy className="h-3.5 w-3.5" />Copy migration JSON</>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); downloadJson(); }}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                        >
                            <Download className="h-3.5 w-3.5" />
                            Download JSON
                        </button>
                    </div>

                    {/* Collapsible migration JSON block */}
                    <div className="space-y-1.5">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setIsJsonExpanded(v => !v); }}
                            className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
                        >
                            <Code2 className="h-3.5 w-3.5" />
                            {isJsonExpanded ? 'Hide' : 'Show'} migration JSON
                            {isJsonExpanded
                                ? <ChevronDown className="h-3 w-3" />
                                : <ChevronRight className="h-3 w-3" />
                            }
                        </button>
                        {isJsonExpanded && (
                            <div className="relative">
                                <pre className="text-xs font-mono bg-amber-100/80 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded p-3 pr-28 overflow-x-auto max-h-64 overflow-y-auto text-amber-900 dark:text-amber-100 whitespace-pre-wrap break-all">
                                    {formattedJson}
                                </pre>
                                {/* Overlay buttons inside the code block */}
                                <div className="absolute top-2 right-2 flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(info.migrationPolicyJson, 'json'); }}
                                        className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-600 transition-colors"
                                        title="Copy JSON"
                                    >
                                        {copiedField === 'json'
                                            ? <><Check className="h-3 w-3 text-green-600" />Copied!</>
                                            : <><Copy className="h-3 w-3" />Copy</>
                                        }
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); downloadJson(); }}
                                        className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-600 transition-colors"
                                        title="Download JSON file"
                                    >
                                        <Download className="h-3 w-3" />
                                        Save
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

