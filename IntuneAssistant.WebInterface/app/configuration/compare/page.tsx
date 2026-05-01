'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Upload,
    FileJson,
    X,
    Search,
    RefreshCw,
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    MinusCircle,
    PlusCircle,
    ArrowLeftRight,
    Info,
    Filter,
    Download,
    BarChart3,
    Layers,
    ShieldCheck,
    ShieldAlert,
    TrendingUp,
} from 'lucide-react';
import {
    POLICY_SETTINGS_CATALOG_ENDPOINT,
    POLICY_SETTINGS_DEVICECONFIG_ENDPOINT,
    POLICY_SETTINGS_GROUPPOLICY_ENDPOINT,
    SETTINGS_DEFINITIONS_RESOLVE_ENDPOINT,
} from '@/lib/constants';
import { useApiRequest } from '@/hooks/useApiRequest';

// ── Types ──────────────────────────────────────────────────────────────────────

type PolicyKind = 'SettingsCatalog' | 'DeviceConfig' | 'GroupPolicy' | 'Unknown';

// Map: settingDefinitionId → { displayName, optionMap: optionItemId → displayName }
interface DefinitionEntry {
    displayName: string;
    optionMap: Map<string, string>;
}
type DefinitionMap = Map<string, DefinitionEntry>;

interface UploadedPolicy {
    fileName: string;
    raw: Record<string, unknown>;
    kind: PolicyKind;
    name: string;
    platform: string;
    odataType: string;
    settings: NormalizedSetting[];
    definitionMap: DefinitionMap; // friendly name lookup for SettingsCatalog
    error?: string;
}

interface NormalizedSetting {
    id: string;
    displayName: string;   // friendly name if available, else raw id
    value: string;         // raw value (used for matching)
    friendlyValue?: string; // human-readable label for the value
    childSettings?: { name: string; value: string; friendlyName?: string; friendlyValue?: string }[];
}

interface TenantSettingsCatalogSetting {
    id: string;
    policyId: string;
    policyName: string;
    settingName: string | null;
    settingValue: string | null;
    childSettingInfo: { name: string; value: string | null }[] | null;
    settingDefinitions: { id: string; name: string | null; displayName: string | null }[] | null;
}

interface TenantDeviceConfigSetting {
    name: string;
    value: string;
    omaUri: string;
    odataType: string;
}

interface TenantGroupPolicySetting {
    id: string;
    enabled: boolean;
    definition: { displayName: string; classType: string };
}

interface TenantPolicy {
    id: string;
    name: string;
    policyType: string;
    policySubType: string | null;
    platform: string;
    isAssigned: boolean;
    settings: TenantSettingsCatalogSetting[] | null;
    deviceConfigSettings: TenantDeviceConfigSetting[] | null;
    groupPolicySettings: TenantGroupPolicySetting[] | null;
}

interface ApiResponse {
    status: string;
    message: string;
    data: TenantPolicy[];
}

// ── Settings definition resolve types ────────────────────────────────────────

interface ResolvedDefinitionOption {
    itemId: string;
    name: string;
    displayName: string;
}

interface ResolvedDefinition {
    id: string;
    rootDefinitionId: string;
    name: string;
    displayName: string;
    description?: string;
    options?: ResolvedDefinitionOption[];
}

interface ResolveApiResponse {
    status: number;
    correlationId: string;
    data: ResolvedDefinition[];
}

// ── New analysis types ────────────────────────────────────────────────────────

interface SettingOccurrence {
    tenantPolicy: TenantPolicy;
    tenantValue: string;
    friendlyTenantValue?: string;
    status: 'match' | 'conflict';
}

interface SettingAnalysis {
    setting: NormalizedSetting;
    occurrences: SettingOccurrence[];
    isMissing: boolean;
}

interface PolicyAnalysisSummary {
    totalSettings: number;
    matchSettings: number;
    conflictSettings: number;
    missingSettings: number;
    matchPercent: number;
    conflictPercent: number;
    missingPercent: number;
    platformMatchedPolicyCount: number;
    totalTenantPoliciesOfKind: number;
}

interface PolicyAnalysis {
    uploadedPolicy: UploadedPolicy;
    platformMatchedPolicies: TenantPolicy[];
    settingAnalyses: SettingAnalysis[];
    summary: PolicyAnalysisSummary;
}

// ── OData type → PolicyKind ───────────────────────────────────────────────────

function detectPolicyKind(odataType: string): PolicyKind {
    const t = odataType.toLowerCase();
    if (t.includes('devicemanagementconfigurationpolicy')) return 'SettingsCatalog';
    if (t.includes('grouppolicyconfiguration')) return 'GroupPolicy';
    if (t.includes('deviceconfiguration') || t.includes('android') || t.includes('ios') || t.includes('macos') || t.includes('windows')) return 'DeviceConfig';
    return 'Unknown';
}

// ── JSON parsers ──────────────────────────────────────────────────────────────

function buildDefinitionMap(raw: Record<string, unknown>): DefinitionMap {
    const map: DefinitionMap = new Map();
    const defs = raw['settingDefinitions'] as Record<string, unknown>[] | undefined;
    if (!defs) return map;
    for (const def of defs) {
        const id = (def['id'] as string | undefined)?.toLowerCase();
        if (!id) continue;
        const displayName = (def['displayName'] as string) || (def['name'] as string) || id;
        const optionMap = new Map<string, string>();
        const options = def['options'] as Record<string, unknown>[] | undefined;
        if (options) {
            for (const opt of options) {
                const itemId = (opt['itemId'] as string | undefined)?.toLowerCase();
                const label = (opt['displayName'] as string) || (opt['name'] as string) || '';
                if (itemId && label) optionMap.set(itemId, label);
            }
        }
        map.set(id, { displayName, optionMap });
    }
    return map;
}

function parseSettingInstance(instance: Record<string, unknown>, defMap?: DefinitionMap): NormalizedSetting | null {
    const defId = instance['settingDefinitionId'] as string | undefined;
    if (!defId) return null;
    let value = '';
    let friendlyValue: string | undefined;
    const children: { name: string; value: string; friendlyName?: string; friendlyValue?: string }[] = [];

    const defEntry = defMap?.get(defId.toLowerCase());
    const displayName = defEntry?.displayName ?? defId;

    const choiceVal = instance['choiceSettingValue'] as Record<string, unknown> | undefined;
    const simpleVal = instance['simpleSettingValue'] as Record<string, unknown> | undefined;
    const collectionVal = instance['choiceSettingCollectionValue'] as Record<string, unknown>[] | undefined;
    const simpleCollectionVal = instance['simpleSettingCollectionValue'] as Record<string, unknown>[] | undefined;

    if (choiceVal) {
        value = (choiceVal['value'] as string) ?? '';
        // Friendly: options map → strip prefix suffix → raw
        const fv = defEntry?.optionMap.get(value.toLowerCase());
        const suffix = value.toLowerCase().startsWith(defId.toLowerCase() + '_')
            ? value.slice(defId.length + 1)
            : undefined;
        const candidate = fv ?? suffix;
        if (candidate && candidate !== value) friendlyValue = candidate;
        const childArr = choiceVal['children'] as Record<string, unknown>[] | undefined;
        if (childArr) {
            for (const child of childArr) {
                const cp = parseSettingInstance(child, defMap);
                if (cp) children.push({
                    name: cp.id,
                    value: cp.value,
                    friendlyName: cp.displayName !== cp.id ? cp.displayName : undefined,
                    friendlyValue: cp.friendlyValue,
                });
            }
        }
    } else if (simpleVal) {
        value = String(simpleVal['value'] ?? '');
    } else if (collectionVal) {
        value = collectionVal.map(c => (c['value'] as string) ?? '').join(', ');
        const fvParts = collectionVal.map(c => {
            const raw = (c['value'] as string) ?? '';
            const mapped = defEntry?.optionMap.get(raw.toLowerCase());
            const suffix = raw.toLowerCase().startsWith(defId.toLowerCase() + '_') ? raw.slice(defId.length + 1) : undefined;
            return mapped ?? suffix ?? raw;
        });
        const joined = fvParts.join(', ');
        if (joined !== value) friendlyValue = joined;
    } else if (simpleCollectionVal) {
        value = simpleCollectionVal.map(c => String(c['value'] ?? '')).join(', ');
    }

    return { id: defId, displayName, value, friendlyValue, childSettings: children.length ? children : undefined };
}

function extractSettingsCatalogSettings(raw: Record<string, unknown>, defMap: DefinitionMap): NormalizedSetting[] {
    const settings = raw['settings'] as Record<string, unknown>[] | undefined;
    if (!settings) return [];
    const result: NormalizedSetting[] = [];
    for (const s of settings) {
        const instance = s['settingInstance'] as Record<string, unknown> | undefined;
        if (!instance) continue;
        const parsed = parseSettingInstance(instance, defMap);
        if (parsed) result.push(parsed);
    }
    return result;
}

const EXCLUDED_DEVICE_CONFIG_KEYS = new Set([
    '@odata.context', '@odata.type', '@odata.id', '@odata.editLink',
    'id', 'createdDateTime', 'lastModifiedDateTime', 'version',
    'supportsScopeTags', 'roleScopeTagIds', 'assignments',
    'description', 'displayName', 'deviceManagementApplicabilityRuleOsEdition',
    'deviceManagementApplicabilityRuleOsVersion', 'deviceManagementApplicabilityRuleDeviceMode',
    'createdDateTimeOdataType', 'lastModifiedDateTimeOdataType', 'roleScopeTagIdsOdataType',
]);

function extractDeviceConfigSettings(raw: Record<string, unknown>): NormalizedSetting[] {
    const result: NormalizedSetting[] = [];
    for (const [key, val] of Object.entries(raw)) {
        if (EXCLUDED_DEVICE_CONFIG_KEYS.has(key) || key.endsWith('@odata.type') || key.endsWith('OdataType')) continue;
        if (val === null || val === undefined) continue;
        result.push({ id: key, displayName: key, value: JSON.stringify(val) });
    }
    return result;
}

function extractGroupPolicySettings(raw: Record<string, unknown>): NormalizedSetting[] {
    const defs = raw['definitionValues'] as Record<string, unknown>[] | undefined;
    if (!defs) return [];
    return defs.map((d, i) => {
        const def = d['definition'] as Record<string, unknown> | undefined;
        const name = (def?.['displayName'] as string) ?? `setting_${i}`;
        const enabled = d['enabled'] as boolean | undefined;
        const pv = d['presentationValues'] as Record<string, unknown>[] | undefined;
        let value = enabled === true ? 'Enabled' : enabled === false ? 'Disabled' : 'Unknown';
        if (pv && pv.length > 0) {
            const vals = pv.map(p => `${p['presentation'] ?? ''}: ${p['value'] ?? ''}`).join('; ');
            value += ` | ${vals}`;
        }
        return { id: name, displayName: name, value };
    });
}

function parseUploadedFile(fileName: string, raw: Record<string, unknown>): UploadedPolicy {
    const odataType = (raw['@odata.type'] as string) ?? '';
    const kind = detectPolicyKind(odataType);
    const name = (raw['name'] as string) ?? (raw['displayName'] as string) ?? fileName.replace(/\.json$/i, '');
    const platform = (raw['platforms'] as string) ?? (raw['platform'] as string) ?? '';
    const definitionMap = buildDefinitionMap(raw);

    let settings: NormalizedSetting[] = [];
    if (kind === 'SettingsCatalog') settings = extractSettingsCatalogSettings(raw, definitionMap);
    else if (kind === 'DeviceConfig') settings = extractDeviceConfigSettings(raw);
    else if (kind === 'GroupPolicy') settings = extractGroupPolicySettings(raw);
    else settings = extractDeviceConfigSettings(raw);

    return { fileName, raw, kind, name, platform, odataType, settings, definitionMap };
}

// ── Platform matching ─────────────────────────────────────────────────────────

function normalizePlatform(p: string): string {
    return p.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function platformMatches(uploadedPlatform: string, tenantPlatform: string): boolean {
    if (!uploadedPlatform || !tenantPlatform) return true;
    const u = normalizePlatform(uploadedPlatform);
    const t = normalizePlatform(tenantPlatform);
    if (u === t) return true;
    if ((u.includes('windows') || u.includes('win10') || u.includes('win11')) &&
        (t.includes('windows') || t.includes('win10') || t.includes('win11'))) return true;
    if (u.includes('ios') && t.includes('ios')) return true;
    if (u.includes('macos') && t.includes('macos')) return true;
    if (u.includes('android') && t.includes('android')) return true;
    return u.includes(t) || t.includes(u);
}

// ── Tenant settings normalizer ────────────────────────────────────────────────

function normalizeTenantSettings(policy: TenantPolicy): NormalizedSetting[] {
    if (policy.settings?.length) {
        return policy.settings.map(s => {
            // Prefer settingName; fall back to displayName from settingDefinitions
            const displayName = s.settingName
                ?? s.settingDefinitions?.find(d => d.id === s.id)?.displayName
                ?? s.id;
            return {
                id: s.id,
                displayName,
                value: s.settingValue ?? s.childSettingInfo?.filter(c => c.value != null).map(c => `${c.name}: ${c.value}`).join(', ') ?? '',
            };
        });
    }
    if (policy.deviceConfigSettings?.length) {
        return policy.deviceConfigSettings.map(s => ({ id: s.name, displayName: s.name, value: s.value }));
    }
    if (policy.groupPolicySettings?.length) {
        return policy.groupPolicySettings.map(s => ({
            id: s.definition.displayName,
            displayName: s.definition.displayName,
            value: s.enabled ? 'Enabled' : 'Disabled',
        }));
    }
    return [];
}

// ── Value normalization for comparison ────────────────────────────────────────
//
// The uploaded JSON stores full option item IDs as choice values, e.g.:
//   device_vendor_msft_passportforwork_biometrics_facialfeaturesuseenhancedantispoofing_true
// The tenant API returns simplified values, e.g.: "true", "Enabled", "Not Configured"
//
// Resolution order:
//   1. Use friendlyValue from the options map (if available)
//   2. Strip the settingId prefix + underscore to get the raw suffix ("_true" → "true")
//   3. Fall back to the raw value as-is

function extractOptionSuffix(settingId: string, optionId: string): string {
    const prefix = settingId.toLowerCase() + '_';
    const lower = optionId.toLowerCase();
    if (lower.startsWith(prefix)) return lower.slice(prefix.length);
    return optionId;
}

function normalizeForComparison(settingId: string, rawValue: string, friendlyValue?: string): string {
    if (friendlyValue) return friendlyValue.toLowerCase().trim();
    const suffix = extractOptionSuffix(settingId, rawValue);
    return suffix.toLowerCase().trim();
}

// ── Analysis engine ───────────────────────────────────────────────────────────

function analyzePolicy(uploaded: UploadedPolicy, allTenantPolicies: TenantPolicy[]): PolicyAnalysis {
    const platformMatchedPolicies = allTenantPolicies.filter(tp => platformMatches(uploaded.platform, tp.platform));

    // Build map: settingId (lower) → [{policy, value, displayName}]
    const tenantSettingMap = new Map<string, { policy: TenantPolicy; value: string; displayName: string }[]>();
    for (const tp of platformMatchedPolicies) {
        for (const ts of normalizeTenantSettings(tp)) {
            const key = ts.id.toLowerCase();
            if (!tenantSettingMap.has(key)) tenantSettingMap.set(key, []);
            tenantSettingMap.get(key)!.push({ policy: tp, value: ts.value, displayName: ts.displayName });
        }
    }

    const settingAnalyses: SettingAnalysis[] = uploaded.settings.map(setting => {
        const hits = tenantSettingMap.get(setting.id.toLowerCase()) ?? [];

        // Resolve friendly setting name: uploaded JSON rarely has settingDefinitions,
        // but the tenant API always returns settingName — use it as fallback.
        const resolvedDisplayName =
            setting.displayName !== setting.id
                ? setting.displayName
                : hits.find(h => h.displayName && h.displayName !== setting.id)?.displayName
                    ?? setting.id;

        const enrichedSetting: NormalizedSetting = resolvedDisplayName !== setting.displayName
            ? { ...setting, displayName: resolvedDisplayName }
            : setting;

        if (hits.length === 0) return { setting: enrichedSetting, occurrences: [], isMissing: true };
        const defEntry = uploaded.definitionMap.get(setting.id.toLowerCase());

        // Normalize the uploaded value for comparison
        const uploadedNorm = normalizeForComparison(setting.id, setting.value, setting.friendlyValue);

        const occurrences: SettingOccurrence[] = hits.map(({ policy, value }) => {
            const fv = defEntry?.optionMap.get(value.toLowerCase());
            const tenantNorm = value.toLowerCase().trim();
            const status = uploadedNorm === tenantNorm ? 'match' : 'conflict';
            return {
                tenantPolicy: policy,
                tenantValue: value,
                friendlyTenantValue: fv && fv !== value ? fv : undefined,
                status,
            };
        });
        return { setting: enrichedSetting, occurrences, isMissing: false };
    });

    const totalSettings = uploaded.settings.length;
    const matchSettings = settingAnalyses.filter(sa => !sa.isMissing && sa.occurrences.some(o => o.status === 'match')).length;
    const conflictSettings = settingAnalyses.filter(sa => !sa.isMissing && sa.occurrences.every(o => o.status === 'conflict')).length;
    const missingSettings = settingAnalyses.filter(sa => sa.isMissing).length;

    return {
        uploadedPolicy: uploaded,
        platformMatchedPolicies,
        settingAnalyses,
        summary: {
            totalSettings,
            matchSettings,
            conflictSettings,
            missingSettings,
            matchPercent: totalSettings === 0 ? 0 : Math.round((matchSettings / totalSettings) * 100),
            conflictPercent: totalSettings === 0 ? 0 : Math.round((conflictSettings / totalSettings) * 100),
            missingPercent: totalSettings === 0 ? 0 : Math.round((missingSettings / totalSettings) * 100),
            platformMatchedPolicyCount: platformMatchedPolicies.length,
            totalTenantPoliciesOfKind: allTenantPolicies.length,
        },
    };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function endpointForKind(kind: PolicyKind): string | null {
    if (kind === 'SettingsCatalog') return POLICY_SETTINGS_CATALOG_ENDPOINT;
    if (kind === 'DeviceConfig') return POLICY_SETTINGS_DEVICECONFIG_ENDPOINT;
    if (kind === 'GroupPolicy') return POLICY_SETTINGS_GROUPPOLICY_ENDPOINT;
    return POLICY_SETTINGS_DEVICECONFIG_ENDPOINT;
}

const kindLabel: Record<PolicyKind, string> = {
    SettingsCatalog: 'Settings Catalog',
    DeviceConfig: 'Device Configuration',
    GroupPolicy: 'Administrative Templates',
    Unknown: 'Unknown',
};

const kindColor: Record<PolicyKind, string> = {
    SettingsCatalog: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    DeviceConfig: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    GroupPolicy: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    Unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

function scoreColor(score: number) {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
}

function ProgressBar({ value, color }: { value: number; color: string }) {
    return (
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
        </div>
    );
}

/** Turns a raw setting ID into a best-effort human readable string by taking
 *  the last meaningful segment (after known vendor prefixes) and title-casing it. */
function humanizeSettingId(id: string): string {
    // Strip common vendor prefix segments
    const stripped = id
        .replace(/^device_vendor_msft_/i, '')
        .replace(/^user_vendor_msft_/i, '');
    // Take the last segment as the most specific part
    const parts = stripped.split('_');
    // Title-case each word
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

/** Shows the friendly name prominently; raw ID in muted small text underneath (only if different) */
function FriendlyName({ id, friendly }: { id: string; friendly?: string }) {
    const display = friendly && friendly !== id ? friendly : humanizeSettingId(id);
    const showRaw = display !== id; // always show raw ID underneath when we have a better name
    return (
        <div className="min-w-0">
            <span className="text-xs font-medium break-words">{display}</span>
            {showRaw && (
                <span className="block font-mono text-[10px] text-muted-foreground/60 break-all leading-tight">{id}</span>
            )}
        </div>
    );
}

/** Shows the friendly value prominently; raw value underneath if different */
function FriendlyValue({ raw, friendly }: { raw: string; friendly?: string }) {
    if (!raw) return <span className="italic text-muted-foreground text-xs">(empty)</span>;
    if (!friendly || friendly === raw) return <span className="text-xs break-all">{raw}</span>;
    return (
        <div className="min-w-0">
            <span className="text-xs font-medium">{friendly}</span>
            <span className="block font-mono text-[10px] text-muted-foreground/60 break-all leading-tight">{raw}</span>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ConfigurationComparePage() {
    const { accounts } = useMsal();
    const { request } = useApiRequest();

    const [uploadedPolicies, setUploadedPolicies] = useState<UploadedPolicy[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [tenantPoliciesCache, setTenantPoliciesCache] = useState<Map<PolicyKind, TenantPolicy[]>>(new Map());
    const [resolvedDefinitionsCache, setResolvedDefinitionsCache] = useState<Map<string, ResolvedDefinition>>(new Map());
    const [hasFetched, setHasFetched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(new Set());
    const [expandedSettings, setExpandedSettings] = useState<Set<string>>(new Set());
    const [settingFilter, setSettingFilter] = useState<'all' | 'match' | 'conflict' | 'missing'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'detail' | 'summary'>('detail');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Derived analyses via useMemo ──────────────────────────────────────────
    const analyses = useMemo<PolicyAnalysis[]>(() => {
        if (!hasFetched || !uploadedPolicies.length) return [];
        return uploadedPolicies.map(uploaded => {
            const tenantPolicies = tenantPoliciesCache.get(uploaded.kind) ?? [];
            const analysis = analyzePolicy(uploaded, tenantPolicies);

            // Enrich missing settings with resolved definitions
            if (resolvedDefinitionsCache.size === 0) return analysis;
            const enrichedSettingAnalyses = analysis.settingAnalyses.map(sa => {
                if (!sa.isMissing) return sa;
                const resolved = resolvedDefinitionsCache.get(sa.setting.id.toLowerCase());
                if (!resolved) return sa;
                const optionMap = new Map<string, string>();
                resolved.options?.forEach(o => optionMap.set(o.itemId.toLowerCase(), o.displayName));
                const friendlyValue = optionMap.get(sa.setting.value.toLowerCase())
                    ?? (sa.setting.value.toLowerCase().startsWith(sa.setting.id.toLowerCase() + '_')
                        ? sa.setting.value.slice(sa.setting.id.length + 1)
                        : undefined);
                return {
                    ...sa,
                    setting: {
                        ...sa.setting,
                        displayName: resolved.displayName,
                        friendlyValue: friendlyValue !== sa.setting.value ? friendlyValue : sa.setting.friendlyValue,
                    },
                };
            });
            return { ...analysis, settingAnalyses: enrichedSettingAnalyses };
        });
    }, [uploadedPolicies, tenantPoliciesCache, resolvedDefinitionsCache, hasFetched]);

    // ── Global summary ────────────────────────────────────────────────────────
    const globalSummary = useMemo(() => {
        if (!analyses.length) return null;
        const totalSettings = analyses.reduce((s, a) => s + a.summary.totalSettings, 0);
        const matchSettings = analyses.reduce((s, a) => s + a.summary.matchSettings, 0);
        const conflictSettings = analyses.reduce((s, a) => s + a.summary.conflictSettings, 0);
        const missingSettings = analyses.reduce((s, a) => s + a.summary.missingSettings, 0);

        const platformBreakdown = analyses.map(a => ({
            policy: a.uploadedPolicy.name,
            platform: a.uploadedPolicy.platform,
            platformMatchedCount: a.summary.platformMatchedPolicyCount,
            totalKindCount: a.summary.totalTenantPoliciesOfKind,
            matchPercent: a.summary.matchPercent,
            conflictPercent: a.summary.conflictPercent,
            missingPercent: a.summary.missingPercent,
        }));

        const conflictMap = new Map<string, number>();
        for (const a of analyses) {
            for (const sa of a.settingAnalyses) {
                if (!sa.isMissing && sa.occurrences.every(o => o.status === 'conflict')) {
                    conflictMap.set(sa.setting.displayName, (conflictMap.get(sa.setting.displayName) ?? 0) + 1);
                }
            }
        }
        const topConflicts = [...conflictMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

        return {
            totalPolicies: analyses.length,
            totalSettings,
            matchSettings,
            conflictSettings,
            missingSettings,
            overallMatchPercent: totalSettings === 0 ? 0 : Math.round((matchSettings / totalSettings) * 100),
            overallConflictPercent: totalSettings === 0 ? 0 : Math.round((conflictSettings / totalSettings) * 100),
            overallMissingPercent: totalSettings === 0 ? 0 : Math.round((missingSettings / totalSettings) * 100),
            platformBreakdown,
            topConflicts,
        };
    }, [analyses]);

    // ── File handling ─────────────────────────────────────────────────────────
    const processFiles = useCallback((files: FileList | File[]) => {
        const fileArray = Array.from(files).filter(f => f.name.endsWith('.json'));
        if (!fileArray.length) return;
        const readers = fileArray.map(file => new Promise<UploadedPolicy>(resolve => {
            const reader = new FileReader();
            reader.onload = e => {
                try {
                    const raw = JSON.parse(e.target?.result as string) as Record<string, unknown>;
                    resolve(parseUploadedFile(file.name, raw));
                } catch {
                    resolve({ fileName: file.name, raw: {}, kind: 'Unknown', name: file.name, platform: '', odataType: '', settings: [], error: 'Invalid JSON' });
                }
            };
            reader.readAsText(file);
        }));
        Promise.all(readers).then(newPolicies => {
            setUploadedPolicies(prev => {
                const existingNames = new Set(prev.map(p => p.fileName));
                return [...prev, ...newPolicies.filter(p => !existingNames.has(p.fileName))];
            });
        });
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        processFiles(e.dataTransfer.files);
    }, [processFiles]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) processFiles(e.target.files);
    };

    const removeUploadedPolicy = (fileName: string) => {
        setUploadedPolicies(prev => prev.filter(p => p.fileName !== fileName));
    };

    // ── Fetch / refresh ───────────────────────────────────────────────────────
    const fetchTenantData = async (clearCache = false) => {
        if (!uploadedPolicies.length || !accounts.length) return;
        setLoading(true);
        setError(null);

        const cache: Map<PolicyKind, TenantPolicy[]> = clearCache ? new Map() : new Map(tenantPoliciesCache);
        const kinds = new Set(uploadedPolicies.map(p => p.kind).filter(k => k !== 'Unknown') as PolicyKind[]);
        const toFetch = [...kinds].filter(k => !cache.has(k));

        try {
            await Promise.all(toFetch.map(async kind => {
                const endpoint = endpointForKind(kind);
                if (!endpoint) return;
                try {
                    const response = await request<ApiResponse>(endpoint, { method: 'GET' });
                    cache.set(kind, response?.data?.data ?? []);
                } catch {
                    cache.set(kind, []);
                }
            }));
            setTenantPoliciesCache(cache);
            setHasFetched(true);
            setExpandedPolicies(new Set(uploadedPolicies.map(p => p.fileName)));

            // ── Resolve missing setting definitions ──────────────────────────
            // Run a quick analysis with the new cache to find all missing IDs
            const quickAnalyses = uploadedPolicies.map(uploaded => {
                const tenantPolicies = cache.get(uploaded.kind) ?? [];
                return analyzePolicy(uploaded, tenantPolicies);
            });
            const missingIds = new Set<string>();
            for (const a of quickAnalyses) {
                for (const sa of a.settingAnalyses) {
                    if (sa.isMissing) missingIds.add(sa.setting.id);
                }
            }

            const existingCache = clearCache ? new Map<string, ResolvedDefinition>() : new Map(resolvedDefinitionsCache);
            const toResolve = [...missingIds].filter(id => !existingCache.has(id.toLowerCase()));

            if (toResolve.length > 0) {
                try {
                    const resolveResponse = await request<ResolveApiResponse>(
                        SETTINGS_DEFINITIONS_RESOLVE_ENDPOINT,
                        { method: 'POST', body: JSON.stringify(toResolve) }
                    );
                    const definitions: ResolvedDefinition[] = resolveResponse?.data?.data ?? [];
                    for (const def of definitions) {
                        existingCache.set(def.id.toLowerCase(), def);
                    }
                    setResolvedDefinitionsCache(new Map(existingCache));
                } catch {
                    // resolve failed — analyses will still work, just without friendly names for missing settings
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Fetch failed');
        } finally {
            setLoading(false);
        }
    };

    // ── UI helpers ────────────────────────────────────────────────────────────
    const togglePolicy = (key: string) => setExpandedPolicies(prev => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key); else next.add(key);
        return next;
    });

    const toggleSetting = (key: string) => setExpandedSettings(prev => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key); else next.add(key);
        return next;
    });

    const filteredSettingAnalyses = (sas: SettingAnalysis[]) => sas.filter(sa => {
        if (settingFilter === 'missing' && !sa.isMissing) return false;
        if (settingFilter === 'match' && (sa.isMissing || !sa.occurrences.some(o => o.status === 'match'))) return false;
        if (settingFilter === 'conflict' && (sa.isMissing || !sa.occurrences.every(o => o.status === 'conflict'))) return false;
        if (searchQuery && !sa.setting.displayName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const settingRowStatus = (sa: SettingAnalysis): 'match' | 'conflict' | 'missing' => {
        if (sa.isMissing) return 'missing';
        if (sa.occurrences.some(o => o.status === 'match')) return 'match';
        return 'conflict';
    };

    const exportResults = () => {
        const rows: Record<string, string>[] = [];
        for (const a of analyses) {
            for (const sa of a.settingAnalyses) {
                if (sa.occurrences.length === 0) {
                    rows.push({ 'Uploaded Policy': a.uploadedPolicy.name, Platform: a.uploadedPolicy.platform, Setting: sa.setting.displayName, 'Setting ID': sa.setting.id, 'Uploaded Value': sa.setting.friendlyValue ?? sa.setting.value, 'Uploaded Value (Raw)': sa.setting.value, 'Tenant Policy': '—', 'Tenant Value': '—', 'Tenant Value (Raw)': '—', Status: 'Missing in Tenant' });
                } else {
                    for (const occ of sa.occurrences) {
                        rows.push({ 'Uploaded Policy': a.uploadedPolicy.name, Platform: a.uploadedPolicy.platform, Setting: sa.setting.displayName, 'Setting ID': sa.setting.id, 'Uploaded Value': sa.setting.friendlyValue ?? sa.setting.value, 'Uploaded Value (Raw)': sa.setting.value, 'Tenant Policy': occ.tenantPolicy.name, 'Tenant Value': occ.friendlyTenantValue ?? occ.tenantValue, 'Tenant Value (Raw)': occ.tenantValue, Status: occ.status === 'match' ? 'Match' : 'Conflict' });
                    }
                }
            }
        }
        const headers = ['Uploaded Policy', 'Platform', 'Setting', 'Setting ID', 'Uploaded Value', 'Uploaded Value (Raw)', 'Tenant Policy', 'Tenant Value', 'Tenant Value (Raw)', 'Status'];
        const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'policy-comparison.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ArrowLeftRight className="h-6 w-6 text-primary" />
                        External Policy Comparison
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Upload JSON policy files and compare their settings against your tenant. Only tenant policies
                        matching the same platform are included.
                    </p>
                </div>
                {analyses.length > 0 && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => fetchTenantData(true)} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh Tenant Data
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportResults}>
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                )}
            </div>

            {/* Upload Zone */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Upload Policy Files</CardTitle>
                    <CardDescription>
                        Drop exported Intune policy JSON files. Policy type and platform are auto-detected. Tenant data
                        is fetched once and reused — use <strong>Refresh Tenant Data</strong> to re-fetch.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'}`}
                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className={`h-10 w-10 mx-auto mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="font-medium text-sm">{isDragging ? 'Drop files here' : 'Click or drag & drop JSON files here'}</p>
                        <p className="text-xs text-muted-foreground mt-1">Supports multiple files. JSON format only.</p>
                        <input ref={fileInputRef} type="file" accept=".json" multiple className="hidden" onChange={handleFileChange} />
                    </div>

                    {uploadedPolicies.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Uploaded files ({uploadedPolicies.length})</p>
                            {uploadedPolicies.map(policy => (
                                <div key={policy.fileName} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                                    <FileJson className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-sm truncate">{policy.name}</span>
                                            <Badge className={`text-xs ${kindColor[policy.kind]}`}>{kindLabel[policy.kind]}</Badge>
                                            {policy.platform && <Badge variant="outline" className="text-xs">{policy.platform}</Badge>}
                                            {policy.error && <Badge variant="destructive" className="text-xs">{policy.error}</Badge>}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">{policy.fileName} · {policy.settings.length} settings detected</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeUploadedPolicy(policy.fileName)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <Button onClick={() => fetchTenantData(false)} disabled={!uploadedPolicies.length || loading || !accounts.length} className="gap-2">
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            {loading ? 'Fetching...' : hasFetched ? 'Re-run Analysis' : 'Compare Against Tenant'}
                        </Button>
                        {uploadedPolicies.length > 0 && (
                            <Button variant="outline" size="sm" onClick={() => { setUploadedPolicies([]); setHasFetched(false); setResolvedDefinitionsCache(new Map()); }}>
                                Clear All
                            </Button>
                        )}
                        {!accounts.length && (
                            <span className="text-sm text-amber-600 flex items-center gap-1">
                                <Info className="h-4 w-4" /> Please sign in first.
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>

            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-4">
                        <p className="text-destructive text-sm flex items-center gap-2">
                            <XCircle className="h-4 w-4" />{error}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            {analyses.length > 0 && globalSummary && (
                <div className="space-y-6">

                    {/* ── Always-visible KPI cards ── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10"><FileJson className="h-5 w-5 text-primary" /></div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Policies Uploaded</p>
                                        <p className="text-2xl font-bold">{globalSummary.totalPolicies}</p>
                                        <p className="text-xs text-muted-foreground">{globalSummary.totalSettings} total settings</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-500/10"><ShieldCheck className="h-5 w-5 text-green-600" /></div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Matched</p>
                                        <p className={`text-2xl font-bold ${scoreColor(globalSummary.overallMatchPercent)}`}>{globalSummary.overallMatchPercent}%</p>
                                        <p className="text-xs text-muted-foreground">{globalSummary.matchSettings} / {globalSummary.totalSettings} settings</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-amber-500/10"><ShieldAlert className="h-5 w-5 text-amber-600" /></div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Conflict</p>
                                        <p className="text-2xl font-bold text-amber-600">{globalSummary.overallConflictPercent}%</p>
                                        <p className="text-xs text-muted-foreground">{globalSummary.conflictSettings} / {globalSummary.totalSettings} settings</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-red-500/10"><XCircle className="h-5 w-5 text-red-600" /></div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Missing</p>
                                        <p className="text-2xl font-bold text-red-600">{globalSummary.overallMissingPercent}%</p>
                                        <p className="text-xs text-muted-foreground">{globalSummary.missingSettings} / {globalSummary.totalSettings} settings</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>


                    {/* Tabs */}
                    <div className="flex gap-2 border-b">
                        {(['detail', 'summary'] as const).map(tab => (
                            <button key={tab}
                                className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === 'detail' ? <><Layers className="h-4 w-4 inline mr-1" />Settings Detail</> : <><BarChart3 className="h-4 w-4 inline mr-1" />Deep Analytics</>}
                            </button>
                        ))}
                    </div>

                    {/* ── SUMMARY TAB ── */}
                    {activeTab === 'summary' && (
                        <div className="space-y-6">

                            {/* ── Overall coverage summary ── */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                        Settings Coverage
                                    </CardTitle>
                                    <CardDescription>
                                        How many of the settings in your uploaded files are already covered in the tenant (matched or conflicting vs. completely absent).
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Overall totals */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span className="font-medium text-foreground text-sm">
                                                Overall — {globalSummary.totalSettings} settings across {globalSummary.totalPolicies} {globalSummary.totalPolicies === 1 ? 'policy' : 'policies'}
                                            </span>
                                            <span>{globalSummary.matchSettings + globalSummary.conflictSettings} covered · {globalSummary.missingSettings} not in tenant</span>
                                        </div>
                                        <div className="flex h-4 w-full rounded-full overflow-hidden gap-0.5 bg-muted">
                                            {globalSummary.overallMatchPercent > 0 && <div className="bg-green-500 h-full transition-all" style={{ width: `${globalSummary.overallMatchPercent}%` }} title={`Match: ${globalSummary.matchSettings}`} />}
                                            {globalSummary.overallConflictPercent > 0 && <div className="bg-amber-400 h-full transition-all" style={{ width: `${globalSummary.overallConflictPercent}%` }} title={`Conflict: ${globalSummary.conflictSettings}`} />}
                                            {globalSummary.overallMissingPercent > 0 && <div className="bg-red-400 h-full transition-all" style={{ width: `${globalSummary.overallMissingPercent}%` }} title={`Missing: ${globalSummary.missingSettings}`} />}
                                        </div>
                                        <div className="flex gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-500" />Match {globalSummary.overallMatchPercent}%</span>
                                            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400" />Conflict {globalSummary.overallConflictPercent}%</span>
                                            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-400" />Not in tenant {globalSummary.overallMissingPercent}%</span>
                                        </div>
                                    </div>

                                    {/* Per-policy cards grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                        {analyses.map(a => {
                                            const covered = a.summary.matchSettings + a.summary.conflictSettings;
                                            const coveredPct = a.summary.totalSettings === 0 ? 0 : Math.round((covered / a.summary.totalSettings) * 100);
                                            const coverColor = coveredPct >= 80 ? 'text-green-600 dark:text-green-400' : coveredPct >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';
                                            return (
                                                <Card key={a.uploadedPolicy.fileName} className="border-2">
                                                    <CardContent className="pt-4 space-y-3">
                                                        {/* Header row */}
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-sm leading-tight">{a.uploadedPolicy.name}</p>
                                                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                                    <Badge className={`text-xs ${kindColor[a.uploadedPolicy.kind]}`}>{kindLabel[a.uploadedPolicy.kind]}</Badge>
                                                                    {a.uploadedPolicy.platform && <Badge variant="outline" className="text-xs">{a.uploadedPolicy.platform}</Badge>}
                                                                    <span className="text-xs text-muted-foreground">{a.summary.totalSettings} settings</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right flex-shrink-0">
                                                                <p className={`text-2xl font-bold ${coverColor}`}>{coveredPct}%</p>
                                                                <p className="text-xs text-muted-foreground">covered</p>
                                                            </div>
                                                        </div>

                                                        {/* Stacked bar */}
                                                        <div className="flex h-3 w-full rounded-full overflow-hidden gap-0.5 bg-muted">
                                                            {a.summary.matchPercent > 0 && <div className="bg-green-500 h-full" style={{ width: `${a.summary.matchPercent}%` }} />}
                                                            {a.summary.conflictPercent > 0 && <div className="bg-amber-400 h-full" style={{ width: `${a.summary.conflictPercent}%` }} />}
                                                            {a.summary.missingPercent > 0 && <div className="bg-red-400 h-full" style={{ width: `${a.summary.missingPercent}%` }} />}
                                                        </div>

                                                        {/* Stat pills */}
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-2 py-1.5 text-center">
                                                                <p className="text-lg font-bold text-green-600 dark:text-green-400">{a.summary.matchSettings}</p>
                                                                <p className="text-[10px] text-green-700 dark:text-green-300">match</p>
                                                                <p className="text-[10px] text-muted-foreground">{a.summary.matchPercent}%</p>
                                                            </div>
                                                            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2 py-1.5 text-center">
                                                                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{a.summary.conflictSettings}</p>
                                                                <p className="text-[10px] text-amber-700 dark:text-amber-300">conflict</p>
                                                                <p className="text-[10px] text-muted-foreground">{a.summary.conflictPercent}%</p>
                                                            </div>
                                                            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-2 py-1.5 text-center">
                                                                <p className="text-lg font-bold text-red-600 dark:text-red-400">{a.summary.missingSettings}</p>
                                                                <p className="text-[10px] text-red-700 dark:text-red-300">not in tenant</p>
                                                                <p className="text-[10px] text-muted-foreground">{a.summary.missingPercent}%</p>
                                                            </div>
                                                        </div>

                                                        {/* Platform footnote */}
                                                        <p className="text-[11px] text-muted-foreground text-right">
                                                            {a.summary.platformMatchedPolicyCount} of {a.summary.totalTenantPoliciesOfKind} tenant policies matched platform
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" />Per-Policy Match Breakdown</CardTitle>
                                    <CardDescription>Match, conflict, and missing percentages per uploaded policy, filtered by platform.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    {globalSummary.platformBreakdown.map(pb => (
                                        <div key={pb.policy} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium text-sm">{pb.policy}</span>
                                                    {pb.platform && <Badge variant="outline" className="text-xs">{pb.platform}</Badge>}
                                                </div>
                                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                                    {pb.platformMatchedCount} of {pb.totalKindCount} tenant policies matched platform
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3 text-xs">
                                                {[
                                                    { label: 'Match', pct: pb.matchPercent, bar: 'bg-green-500', text: 'text-green-600' },
                                                    { label: 'Conflict', pct: pb.conflictPercent, bar: 'bg-amber-500', text: 'text-amber-600' },
                                                    { label: 'Missing', pct: pb.missingPercent, bar: 'bg-red-500', text: 'text-red-600' },
                                                ].map(item => (
                                                    <div key={item.label} className="space-y-1">
                                                        <div className="flex justify-between">
                                                            <span className={item.text}>{item.label}</span>
                                                            <span className="font-medium">{item.pct}%</span>
                                                        </div>
                                                        <ProgressBar value={item.pct} color={item.bar} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Platform filter stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2"><Filter className="h-4 w-4" />Platform Filtering</CardTitle>
                                    <CardDescription>How many tenant policies were considered per uploaded policy after platform matching.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="divide-y">
                                        {analyses.map(a => (
                                            <div key={a.uploadedPolicy.fileName} className="py-3 flex items-center justify-between">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <FileJson className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">{a.uploadedPolicy.name}</span>
                                                    {a.uploadedPolicy.platform && <Badge variant="outline" className="text-xs">{a.uploadedPolicy.platform}</Badge>}
                                                    <Badge className={`text-xs ${kindColor[a.uploadedPolicy.kind]}`}>{kindLabel[a.uploadedPolicy.kind]}</Badge>
                                                </div>
                                                <div className="text-right text-sm">
                                                    <span className="font-semibold">{a.summary.platformMatchedPolicyCount}</span>
                                                    <span className="text-muted-foreground"> / {a.summary.totalTenantPoliciesOfKind} tenant policies</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Top conflict hotspots */}
                            {globalSummary.topConflicts.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" />Top Conflict Hotspots</CardTitle>
                                        <CardDescription>Settings that have conflicting values across the most uploaded policies.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                                        {globalSummary.topConflicts.map(([settingId, count]) => (
                                                            <div key={settingId} className="flex items-center justify-between p-2 rounded border bg-amber-50/50 dark:bg-amber-900/10">
                                                                <div className="min-w-0 mr-3">
                                                                    <span className="text-xs font-medium break-words">{humanizeSettingId(settingId)}</span>
                                                                    <span className="block font-mono text-[10px] text-muted-foreground/60 break-all leading-tight">{settingId}</span>
                                                                </div>
                                                                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 flex-shrink-0">
                                                                    {count} {count === 1 ? 'policy' : 'policies'}
                                                                </Badge>
                                                            </div>
                                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* ── DETAIL TAB ── */}
                    {activeTab === 'detail' && (
                        <div className="space-y-4">
                            {/* Controls */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Filter:</span>
                                </div>
                                {(['all', 'match', 'conflict', 'missing'] as const).map(f => (
                                    <Button key={f} variant={settingFilter === f ? 'default' : 'outline'} size="sm" onClick={() => setSettingFilter(f)}>
                                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                                    </Button>
                                ))}
                                <div className="flex-1" />
                                <div className="flex items-center gap-2">
                                    <Search className="h-4 w-4 text-muted-foreground" />
                                    <input type="text" placeholder="Search settings…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="border rounded px-2 py-1 text-sm bg-background w-52" />
                                </div>
                            </div>

                            {/* Per-policy cards */}
                            {analyses.map(analysis => {
                                const isExpanded = expandedPolicies.has(analysis.uploadedPolicy.fileName);
                                const filtered = filteredSettingAnalyses(analysis.settingAnalyses);

                                // Hide the whole card when the active filter yields no settings for this policy
                                if (settingFilter !== 'all' && filtered.length === 0) return null;

                                return (
                                    <Card key={analysis.uploadedPolicy.fileName} className="overflow-hidden">
                                        {/* Policy header */}
                                        <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => togglePolicy(analysis.uploadedPolicy.fileName)}>
                                            {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                            <FileJson className="h-5 w-5 text-primary" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold">{analysis.uploadedPolicy.name}</span>
                                                    <Badge className={`text-xs ${kindColor[analysis.uploadedPolicy.kind]}`}>{kindLabel[analysis.uploadedPolicy.kind]}</Badge>
                                                    {analysis.uploadedPolicy.platform && <Badge variant="outline" className="text-xs">{analysis.uploadedPolicy.platform}</Badge>}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                    <span>{analysis.summary.totalSettings} settings</span>
                                                    <span>·</span>
                                                    <span>{analysis.summary.platformMatchedPolicyCount} tenant policies (platform match)</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 text-xs flex-shrink-0">
                                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle2 className="h-3 w-3" />{analysis.summary.matchPercent}%</span>
                                                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><AlertTriangle className="h-3 w-3" />{analysis.summary.conflictPercent}%</span>
                                                <span className="flex items-center gap-1 text-red-600 dark:text-red-400"><XCircle className="h-3 w-3" />{analysis.summary.missingPercent}%</span>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <CardContent className="pt-0 pb-4 px-0">
                                                {analysis.summary.platformMatchedPolicyCount === 0 ? (
                                                    <div className="mx-4 rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                                                        <MinusCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                        <p className="text-sm">No tenant policies matched platform <strong>{analysis.uploadedPolicy.platform || '(unknown)'}</strong>.</p>
                                                        <p className="text-xs mt-1">All {analysis.summary.totalTenantPoliciesOfKind} tenant {kindLabel[analysis.uploadedPolicy.kind]} policies were excluded.</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="grid grid-cols-[2fr_1fr_auto] gap-2 px-4 py-2 bg-muted/10 text-xs font-medium text-muted-foreground border-t border-b">
                                                            <span>Setting (from uploaded policy)</span>
                                                            <span>Uploaded Value</span>
                                                            <span className="w-44 text-right pr-2">Status</span>
                                                        </div>
                                                        {filtered.length === 0 && (
                                                            <div className="p-4 text-center text-sm text-muted-foreground">No settings match current filter.</div>
                                                        )}
                                                        <div className="divide-y">
                                                            {filtered.map((sa, i) => {
                                                                const status = settingRowStatus(sa);
                                                                const settingKey = `${analysis.uploadedPolicy.fileName}__${sa.setting.id}`;
                                                                const isSettingExpanded = expandedSettings.has(settingKey);
                                                                const rowBg = status === 'match' ? 'bg-green-50/30 dark:bg-green-900/10' : status === 'conflict' ? 'bg-amber-50/30 dark:bg-amber-900/10' : 'bg-red-50/30 dark:bg-red-900/10';

                                                                return (
                                                                    <div key={i}>
                                                                        <div
                                                                            className={`grid grid-cols-[2fr_1fr_auto] gap-2 px-4 py-2.5 text-sm items-center hover:bg-muted/10 ${!sa.isMissing && sa.occurrences.length > 0 ? 'cursor-pointer' : ''} ${rowBg}`}
                                                                            onClick={() => !sa.isMissing && sa.occurrences.length > 0 && toggleSetting(settingKey)}
                                                                        >
                                                                            <div className="flex items-center gap-2 min-w-0">
                                                                                {!sa.isMissing && sa.occurrences.length > 0
                                                                                    ? (isSettingExpanded ? <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />)
                                                                                    : <span className="w-3 h-3 flex-shrink-0" />
                                                                                }
                                                                                <FriendlyName id={sa.setting.id} friendly={sa.setting.displayName !== sa.setting.id ? sa.setting.displayName : undefined} />
                                                                            </div>
                                                                            <FriendlyValue raw={sa.setting.value} friendly={sa.setting.friendlyValue} />
                                                                            <div className="w-44 flex justify-end pr-2">
                                                                                {status === 'match' && (
                                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800">
                                                                                        <CheckCircle2 className="h-3 w-3" />Match ({sa.occurrences.filter(o => o.status === 'match').length} policies)
                                                                                    </span>
                                                                                )}
                                                                                {status === 'conflict' && (
                                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800">
                                                                                        <AlertTriangle className="h-3 w-3" />Conflict ({sa.occurrences.length} policies)
                                                                                    </span>
                                                                                )}
                                                                                {status === 'missing' && (
                                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800">
                                                                                        <XCircle className="h-3 w-3" />Not in Tenant
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                        {/* Expanded: tenant policies that have this setting */}
                                                        {isSettingExpanded && sa.occurrences.length > 0 && (
                                                            <div className="border-t bg-muted/5">
                                                                {/* Setting context banner */}
                                                                <div className="px-8 py-2 bg-muted/30 border-b flex items-start gap-2">
                                                                    <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                                    <div className="min-w-0">
                                                                        <span className="text-xs font-semibold">{sa.setting.displayName !== sa.setting.id ? sa.setting.displayName : humanizeSettingId(sa.setting.id)}</span>
                                                                        {sa.setting.displayName !== sa.setting.id && (
                                                                            <span className="block font-mono text-[10px] text-muted-foreground/60 break-all leading-tight">{sa.setting.id}</span>
                                                                        )}
                                                                        <span className="block text-[10px] text-muted-foreground mt-0.5">
                                                                            Uploaded value: <strong>{sa.setting.friendlyValue ?? sa.setting.value}</strong>
                                                                            {sa.setting.friendlyValue && sa.setting.friendlyValue !== sa.setting.value && (
                                                                                <span className="font-mono ml-1 opacity-60">({sa.setting.value})</span>
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-[2fr_1fr_auto] gap-2 px-8 py-1.5 text-xs font-medium text-muted-foreground bg-muted/20">
                                                                    <span>Tenant Policy</span>
                                                                    <span>Tenant Value</span>
                                                                    <span className="w-44 text-right pr-2">Match?</span>
                                                                </div>
                                                                                {sa.occurrences.map((occ, j) => (
                                                                                    <div key={j} className={`grid grid-cols-[2fr_1fr_auto] gap-2 px-8 py-2 text-xs items-center border-t ${occ.status === 'match' ? 'bg-green-50/20 dark:bg-green-900/5' : 'bg-amber-50/20 dark:bg-amber-900/5'}`}>
                                                                                        <div className="flex items-center gap-2 min-w-0">
                                                                                            <span className="font-medium truncate">{occ.tenantPolicy.name}</span>
                                                                                            {occ.tenantPolicy.platform && <Badge variant="outline" className="text-xs flex-shrink-0">{occ.tenantPolicy.platform}</Badge>}
                                                                                        </div>
                                                                                        <FriendlyValue raw={occ.tenantValue} friendly={occ.friendlyTenantValue} />
                                                                                        <div className="w-44 flex justify-end pr-2">
                                                                                            {occ.status === 'match'
                                                                                                ? <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle2 className="h-3 w-3" />Match</span>
                                                                                                : <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400"><AlertTriangle className="h-3 w-3" />Conflict</span>
                                                                                            }
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </>
                                                )}
                                            </CardContent>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

