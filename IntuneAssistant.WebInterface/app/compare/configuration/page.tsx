'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';import { useMsal } from '@azure/msal-react';
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
    Download,
    BarChart3,
    Layers,
    ShieldCheck,
    ShieldAlert,
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
    value: string;         // human-readable value (settingValue from tenant, or suffix from upload)
    valueId?: string;      // full option item ID (settingValueId from tenant, or raw value from upload)
    friendlyValue?: string; // human-readable label for the value
    childSettings?: { name: string; value: string; friendlyName?: string; friendlyValue?: string }[];
}

interface TenantSettingsCatalogSetting {
    id: string;
    policyId: string;
    policyName: string;
    settingName: string | null;
    settingValue: string | null;
    settingValueId: string | null;   // full option item ID — use this for ID-based comparison
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
    tenantValue: string;       // human-readable (settingValue)
    tenantValueId?: string;    // full option item ID (settingValueId) — used for comparison
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
    // assigned (production) breakdown
    assignedMatchSettings: number;
    assignedConflictSettings: number;
    assignedMatchPercent: number;
    assignedConflictPercent: number;
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
    'description', 'displayName', 'name',
    'deviceManagementApplicabilityRuleOsEdition',
    'deviceManagementApplicabilityRuleOsVersion', 'deviceManagementApplicabilityRuleDeviceMode',
    'createdDateTimeOdataType', 'lastModifiedDateTimeOdataType', 'roleScopeTagIdsOdataType',
    'omaSettings', 'deviceConfigSettings', 'kioskProfiles',
]);

/** Extract an app identifier from a kiosk app object (various Graph API shapes) */
function extractKioskAppId(app: Record<string, unknown>): string {
    return (
        (app['appUserModelId'] as string | undefined) ??
        (app['desktopApplicationId'] as string | undefined) ??
        (app['storeAppIdentifier'] as string | undefined) ??
        (app['packageFamilyName'] as string | undefined) ??
        ''
    );
}

/** Format a kioskProfile object into a summary string matching the tenant API format.
 *  Tenant format: "Profile: {name}, Users: {type}, AppType: MultiApp, TaskbarOff, Apps: [id1 | id2]"
 */
function formatKioskProfile(profile: Record<string, unknown>): { value: string; displayName: string } {
    const profileName = (profile['profileName'] as string | undefined) ?? '';
    const appCfg = profile['appConfiguration'] as Record<string, unknown> | undefined;
    const appType = appCfg?.['@odata.type'] as string | undefined ?? '';
    const isMultiApp = appType.toLowerCase().includes('multipleapps') || appType.toLowerCase().includes('multiapp');
    const appTypeLabel = isMultiApp ? 'MultiApp' : 'SingleApp';

    // Apps
    const apps: string[] = [];
    if (isMultiApp) {
        const appArr = appCfg?.['apps'] as Record<string, unknown>[] | undefined;
        appArr?.forEach(a => {
            const id = extractKioskAppId(a);
            if (id) apps.push(id);
        });
    } else {
        const singleApp = appCfg?.['app'] as Record<string, unknown> | undefined;
        if (singleApp) {
            const id = extractKioskAppId(singleApp);
            if (id) apps.push(id);
        }
    }

    // Taskbar
    const showTaskBar = appCfg?.['showTaskBar'] as boolean | undefined;
    const taskbarPart = showTaskBar === false ? ', TaskbarOff' : '';

    // Users — tenant shows "Unknown" when userAccountsConfiguration is empty/autologon
    const userCfg = profile['userAccountsConfiguration'] as Record<string, unknown>[] | undefined;
    const userType = (userCfg && userCfg.length > 0)
        ? ((userCfg[0]['@odata.type'] as string | undefined) ?? 'Unknown').replace('#microsoft.graph.', '')
        : 'Unknown';

    const appsStr = apps.length > 0 ? `, Apps: [${apps.join(' | ')}]` : '';
    const value = `Profile: ${profileName}, Users: ${userType}, AppType: ${appTypeLabel}${taskbarPart}${appsStr}`;
    const displayName = `KioskProfile: ${profileName || 'unnamed'} (${appTypeLabel})`;
    return { value, displayName };
}

/** Compare an uploaded kiosk profile formatted value against the tenant's summary string.
 *  Checks app IDs, app type, and taskbar setting. */
function compareKioskValues(uploadedValue: string, tenantValue: string): boolean {
    const t = tenantValue.toLowerCase();
    const u = uploadedValue.toLowerCase();

    // Must agree on MultiApp vs SingleApp
    const uMulti = u.includes('multiapp');
    const tMulti = t.includes('multiapp');
    if (uMulti !== tMulti) return false;

    // Taskbar: if uploaded says TaskbarOff, tenant must too (and vice versa)
    const uTaskbarOff = u.includes('taskbaroff');
    const tTaskbarOff = t.includes('taskbaroff');
    if (uTaskbarOff !== tTaskbarOff) return false;

    // Apps: every app ID in the uploaded value must appear in the tenant value
    const appsMatch = u.match(/apps:\s*\[([^\]]*)\]/);
    if (appsMatch) {
        const uploadedApps = appsMatch[1].split('|').map(a => a.trim()).filter(Boolean);
        if (!uploadedApps.every(a => t.includes(a))) return false;
    }

    return true;
}

function extractDeviceConfigSettings(raw: Record<string, unknown>): NormalizedSetting[] {
    // 0. Kiosk profiles: windows10KioskConfiguration has kioskProfiles[] where each
    //    profile maps to a KioskProfile[{id}] entry in the tenant response.
    const kioskProfiles = raw['kioskProfiles'] as Record<string, unknown>[] | undefined;
    if (Array.isArray(kioskProfiles) && kioskProfiles.length > 0) {
        return kioskProfiles.map(profile => {
            const id = (profile['id'] as string | undefined) ?? '';
            const { value, displayName } = formatKioskProfile(profile);
            return {
                id: `KioskProfile[${id}]`,
                displayName,
                value,
                friendlyValue: value,
            };
        });
    }

    // 1. Raw Graph API format: omaSettings[] — windows10CustomConfiguration exported directly from Graph
    const omaArr = raw['omaSettings'] as Record<string, unknown>[] | undefined;
    if (Array.isArray(omaArr) && omaArr.length > 0) {
        return omaArr.map(s => {
            const omaUri      = (s['omaUri']       as string | undefined) ?? '';
            const displayName = (s['displayName']  as string | undefined) ?? omaUri;
            const odataType   = ((s['@odata.type'] as string | undefined) ?? '').toLowerCase();

            // XML settings (e.g. AssignedAccess kiosk config) — the value is base64 binary.
            // Use the fileName as the friendly value; keep base64 as raw value so it's preserved.
            if (odataType.includes('omasettingstringxml')) {
                const fileName = (s['fileName'] as string | undefined) ?? 'config.xml';
                return { id: omaUri, displayName, value: String(s['value'] ?? ''), friendlyValue: `XML: ${fileName}` };
            }

            const value = String(s['value'] ?? '');
            return { id: omaUri, displayName, value };
        });
    }

    // 2. Backend-normalized format: deviceConfigSettings[] with omaUri/name/value
    const dcArr = raw['deviceConfigSettings'] as Record<string, unknown>[] | undefined;
    if (Array.isArray(dcArr) && dcArr.length > 0) {
        return dcArr.map(s => {
            const omaUri = (s['omaUri'] as string | undefined) ?? '';
            const name   = (s['name']   as string | undefined) ?? omaUri;
            const value  = String(s['value'] ?? '');
            return { id: omaUri || name, displayName: name, value };
        });
    }

    // 3. Generic flat DeviceConfig: extract meaningful top-level scalar fields,
    //    skipping all metadata, navigation/association links, action links and nulls.
    const result: NormalizedSetting[] = [];
    for (const [key, val] of Object.entries(raw)) {
        if (val === null || val === undefined) continue;
        if (EXCLUDED_DEVICE_CONFIG_KEYS.has(key)) continue;
        // Skip @odata.* annotation keys (e.g. "assignments@odata.context")
        if (key.includes('@odata.')) continue;
        // Skip #microsoft.graph.* action link keys
        if (key.startsWith('#')) continue;
        // Skip OdataType suffixes
        if (key.endsWith('OdataType')) continue;
        // Use String() for primitives so strings aren't wrapped in extra quotes
        // (JSON.stringify("http://bing.com") → '"http://bing.com"' which mismatches tenant)
        // For objects: store raw JSON as value (used for comparison) and formatted string as friendlyValue
        let strVal: string;
        let friendlyValue: string | undefined;
        if (typeof val === 'object') {
            strVal = JSON.stringify(val);
            const formatted = formatObjectValue(val as Record<string, unknown>);
            if (formatted) friendlyValue = formatted;
        } else {
            strVal = String(val);
        }
        result.push({ id: key, displayName: key, value: strVal, friendlyValue });
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
            const displayName = s.settingName
                ?? s.settingDefinitions?.find(d => d.id === s.id)?.displayName
                ?? s.id;
            return {
                id: s.id,
                displayName,
                value: s.settingValue ?? s.childSettingInfo?.filter(c => c.value != null).map(c => `${c.name}: ${c.value}`).join(', ') ?? '',
                valueId: s.settingValueId ?? undefined,
            };
        });
    }
    if (policy.deviceConfigSettings?.length) {
        return policy.deviceConfigSettings.map(s => {
            // Use omaUri when present; fall back to name (handles KioskProfile[guid] entries where omaUri is null)
            const id = (s.omaUri && s.omaUri.trim()) ? s.omaUri : s.name;
            return { id, displayName: s.name, value: s.value };
        });
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
// Primary: compare uploaded raw value (full option item ID) against tenant settingValueId.
// Both are full option item IDs so they can be compared directly as strings.
// Fallback (DeviceConfig / GroupPolicy): strip the settingId prefix suffix and compare.
// Special case: JSON object values (e.g. windowsKioskForceUpdateSchedule) — compare
// the meaningful fields from the uploaded object against the tenant's "Key: Value, ..." string.

function extractOptionSuffix(settingId: string, optionId: string): string {
    const prefix = settingId.toLowerCase() + '_';
    const lower = optionId.toLowerCase();
    if (lower.startsWith(prefix)) return lower.slice(prefix.length);
    return optionId;
}

/** Format an ISO datetime string to HH:MM */
function isoToTime(val: string): string {
    const m = val.match(/T(\d{2}:\d{2})/);
    return m ? m[1] : val;
}

/**
 * Format a complex object (e.g. windowsKioskForceUpdateSchedule) into a
 * human-readable "Key: Value, ..." string for display.
 * Skips @odata.* metadata fields and false boolean flags.
 */
function formatObjectValue(obj: Record<string, unknown>): string {
    const parts: string[] = [];
    for (const [key, val] of Object.entries(obj)) {
        if (key.includes('@odata.') || val === null || val === undefined) continue;
        // Suppress false booleans (they're the default / unset state)
        if (typeof val === 'boolean' && !val) continue;
        // PascalCase key (dayofWeek → DayofWeek, startDateTime → StartDateTime)
        const fKey = key.charAt(0).toUpperCase() + key.slice(1);
        let fVal: string;
        if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
            fVal = isoToTime(val);
        } else if (typeof val === 'string') {
            fVal = val.charAt(0).toUpperCase() + val.slice(1);
        } else {
            fVal = String(val);
        }
        parts.push(`${fKey}: ${fVal}`);
    }
    return parts.join(', ');
}

/**
 * Compare a JSON-object uploaded value against the tenant's "Key: Value, ..." string.
 * Extracts all meaningful scalar values from the uploaded object and checks
 * whether every one of them appears (case-insensitively) in the tenant string.
 */
function compareObjectWithTenant(uploadedJson: string, tenantValue: string): boolean {
    try {
        const obj = JSON.parse(uploadedJson) as Record<string, unknown>;
        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return false;

        const uploaded: string[] = [];
        for (const [key, val] of Object.entries(obj)) {
            if (key.includes('@odata.') || val === null || val === undefined) continue;
            if (typeof val === 'boolean') { if (!val) continue; uploaded.push('true'); continue; }
            if (typeof val === 'string') {
                uploaded.push(val.match(/^\d{4}-\d{2}-\d{2}T/) ? isoToTime(val).toLowerCase() : val.toLowerCase());
            } else if (typeof val === 'number') {
                uploaded.push(String(val));
            }
        }
        if (uploaded.length === 0) return false;
        const tenantLower = tenantValue.toLowerCase();
        return uploaded.every(v => tenantLower.includes(v));
    } catch {
        return false;
    }
}

function valuesMatch(
    settingId: string,
    uploadedRawValue: string,
    tenantValue: string,
    tenantValueId?: string,
): boolean {
    // Best path: compare full option IDs directly
    if (tenantValueId) {
        return uploadedRawValue.toLowerCase() === tenantValueId.toLowerCase();
    }
    // KioskProfile[guid] — semantic comparison of formatted summary strings
    if (settingId.toLowerCase().startsWith('kioskprofile[')) {
        return compareKioskValues(uploadedRawValue, tenantValue);
    }
    // If uploaded value is a JSON object (e.g. windowsKioskForceUpdateSchedule),
    // do semantic field-level comparison against the tenant's "Key: Value, ..." string
    const trimmed = uploadedRawValue.trim();
    if (trimmed.startsWith('{')) {
        return compareObjectWithTenant(trimmed, tenantValue);
    }
    // Fallback: strip prefix from uploaded value and compare against tenant human-readable value
    const uploadedSuffix = extractOptionSuffix(settingId, uploadedRawValue);
    // Case-insensitive trim comparison (handles "True" vs "true", "http://…" vs extra whitespace)
    return uploadedSuffix.toLowerCase().trim() === tenantValue.toLowerCase().trim();
}

// ── Analysis engine ───────────────────────────────────────────────────────────

function analyzePolicy(uploaded: UploadedPolicy, allTenantPolicies: TenantPolicy[]): PolicyAnalysis {
    const platformMatchedPolicies = allTenantPolicies.filter(tp => platformMatches(uploaded.platform, tp.platform));

    // Build map: settingId (lower) → [{policy, value, valueId, displayName}]
    const tenantSettingMap = new Map<string, { policy: TenantPolicy; value: string; valueId?: string; displayName: string }[]>();
    for (const tp of platformMatchedPolicies) {
        for (const ts of normalizeTenantSettings(tp)) {
            const key = ts.id.toLowerCase();
            if (!tenantSettingMap.has(key)) tenantSettingMap.set(key, []);
            tenantSettingMap.get(key)!.push({ policy: tp, value: ts.value, valueId: ts.valueId, displayName: ts.displayName });
        }
    }

    const settingAnalyses: SettingAnalysis[] = uploaded.settings.map(setting => {
        let hits = tenantSettingMap.get(setting.id.toLowerCase()) ?? [];

        // KioskProfile[guid] — GUIDs differ between tenants/policies.
        // Fall back to content-based matching against ANY KioskProfile[*] tenant entries.
        if (hits.length === 0 && /^kioskprofile\[/i.test(setting.id)) {
            for (const [key, tenantHits] of tenantSettingMap.entries()) {
                if (/^kioskprofile\[/i.test(key)) hits = [...hits, ...tenantHits];
            }
        }

        // Resolve friendly setting name from tenant data
        const resolvedDisplayName =
            setting.displayName !== setting.id
                ? setting.displayName
                : hits.find(h => h.displayName && h.displayName !== setting.id)?.displayName
                    ?? setting.id;

        // Resolve friendly value for the UPLOADED setting:
        // 1. Already set from options map in uploaded JSON
        // 2. Borrow tenant's human-readable settingValue when its settingValueId matches our raw value
        // 3. Suffix-strip fallback (handled by FriendlyValue component)
        let resolvedFriendlyValue = setting.friendlyValue;
        if (!resolvedFriendlyValue) {
            const matchingHit = hits.find(h =>
                h.valueId && h.valueId.toLowerCase() === setting.value.toLowerCase()
            );
            if (matchingHit && matchingHit.value && matchingHit.value !== setting.value) {
                resolvedFriendlyValue = matchingHit.value;
            }
        }

        const enrichedSetting: NormalizedSetting = (resolvedDisplayName !== setting.displayName || resolvedFriendlyValue !== setting.friendlyValue)
            ? { ...setting, displayName: resolvedDisplayName, friendlyValue: resolvedFriendlyValue }
            : setting;

        if (hits.length === 0) return { setting: enrichedSetting, occurrences: [], isMissing: true };
        const defEntry = uploaded.definitionMap.get(setting.id.toLowerCase());

        const occurrences: SettingOccurrence[] = hits.map(({ policy, value, valueId }) => {
            const fv = defEntry?.optionMap.get((valueId ?? value).toLowerCase());
            const status = valuesMatch(setting.id, setting.value, value, valueId) ? 'match' : 'conflict';
            return {
                tenantPolicy: policy,
                tenantValue: value,
                tenantValueId: valueId,
                friendlyTenantValue: fv && fv !== value ? fv : undefined,
                status,
            };
        });
        // Sort occurrences: assigned (production) first
        occurrences.sort((a, b) => (b.tenantPolicy.isAssigned ? 1 : 0) - (a.tenantPolicy.isAssigned ? 1 : 0));
        return { setting: enrichedSetting, occurrences, isMissing: false };
    });

    const totalSettings = uploaded.settings.length;
    const matchSettings = settingAnalyses.filter(sa => !sa.isMissing && sa.occurrences.some(o => o.status === 'match')).length;
    const conflictSettings = settingAnalyses.filter(sa => !sa.isMissing && sa.occurrences.every(o => o.status === 'conflict')).length;
    const missingSettings = settingAnalyses.filter(sa => sa.isMissing).length;

    // Assigned (production) breakdown — only considers occurrences from assigned policies
    const assignedMatchSettings = settingAnalyses.filter(sa =>
        !sa.isMissing && sa.occurrences.some(o => o.status === 'match' && o.tenantPolicy.isAssigned)
    ).length;
    const assignedConflictSettings = settingAnalyses.filter(sa =>
        !sa.isMissing && sa.occurrences.filter(o => o.tenantPolicy.isAssigned).length > 0 &&
        sa.occurrences.filter(o => o.tenantPolicy.isAssigned).every(o => o.status === 'conflict')
    ).length;

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
            assignedMatchSettings,
            assignedConflictSettings,
            assignedMatchPercent: totalSettings === 0 ? 0 : Math.round((assignedMatchSettings / totalSettings) * 100),
            assignedConflictPercent: totalSettings === 0 ? 0 : Math.round((assignedConflictSettings / totalSettings) * 100),
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

/** Skeleton loading banner shown while fetching / resolving */
function LoadingBanner({ phase, onCancel }: { phase: 'fetching' | 'resolving'; onCancel: () => void }) {
    const phaseLabel = phase === 'fetching' ? 'Fetching tenant policies…' : 'Resolving setting definitions…';
    const phaseDesc = phase === 'fetching'
        ? 'Downloading policy data from your tenant. This may take a moment.'
        : 'Looking up friendly names for settings not found in the tenant.';

    return (
        <Card className="border overflow-hidden">
            <CardContent className="p-4 space-y-4">
                {/* Phase label + cancel */}
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold">{phaseLabel}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{phaseDesc}</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onCancel}
                        className="flex-shrink-0 border-destructive/50 text-destructive hover:bg-destructive/10 gap-1.5"
                    >
                        <XCircle className="h-4 w-4" />
                        Cancel
                    </Button>
                </div>

                {/* Skeleton header row */}
                <div className="flex gap-3 items-center px-1">
                    <div className="h-3 w-2/5 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-1/5 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-16 rounded bg-muted animate-pulse ml-auto" />
                </div>

                {/* Skeleton data rows — staggered opacity for wave effect */}
                {([1, 0.65, 0.4, 0.2] as const).map((opacity, i) => (
                    <div key={i} className="flex gap-3 items-center px-1" style={{ opacity }}>
                        <div className="h-8 w-8 rounded bg-muted animate-pulse flex-shrink-0" />
                        <div className="flex-1 space-y-1.5 min-w-0">
                            <div className="h-2.5 rounded bg-muted animate-pulse" style={{ width: `${60 + (i * 7) % 25}%` }} />
                            <div className="h-2 rounded bg-muted/60 animate-pulse" style={{ width: `${35 + (i * 11) % 20}%` }} />
                        </div>
                        <div className="h-5 w-20 rounded-full bg-muted animate-pulse flex-shrink-0" />
                    </div>
                ))}
            </CardContent>
        </Card>
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

/** Shows the value in the most readable form:
 *  - If friendlyValue and suffix both exist → "suffix (friendlyValue)"
 *  - If only friendlyValue → "friendlyValue"
 *  - If only suffix → "suffix"
 *  Raw option ID shown in muted small text underneath when it differs from the display. */
function FriendlyValue({ raw, friendly, settingId }: { raw: string; friendly?: string; settingId?: string }) {
    if (!raw) return <span className="italic text-muted-foreground text-xs">(empty)</span>;

    const suffix = settingId && raw.toLowerCase().startsWith(settingId.toLowerCase() + '_')
        ? raw.slice(settingId.length + 1)
        : null;

    // Build primary display: "suffix (friendly)" or "friendly" or "suffix" or raw
    let primary: string;
    if (suffix && friendly && friendly !== suffix && friendly !== raw) {
        primary = `${suffix} (${friendly})`;
    } else if (friendly && friendly !== raw) {
        primary = friendly;
    } else if (suffix && suffix !== raw) {
        primary = suffix;
    } else {
        primary = raw;
    }

    // Always show raw underneath when it differs from primary
    const showRaw = primary !== raw;

    return (
        <div className="min-w-0">
            <span className="text-xs font-medium break-words">{primary}</span>
            {showRaw && (
                <span className="block font-mono text-[10px] text-muted-foreground/60 break-all leading-tight">{raw}</span>
            )}
        </div>
    );
}

// ── Coverage-style rows for a single uploaded policy's settings ───────────────

type CoverageStatus = 'covered' | 'conflict' | 'notConfigured';

function settingCoverageStatus(sa: SettingAnalysis): CoverageStatus {
    if (sa.isMissing) return 'notConfigured';
    if (sa.occurrences.some(o => o.status === 'match')) return 'covered';
    return 'conflict';
}

const coverageStatusCfg: Record<CoverageStatus, { label: string; badge: string; rowBg: string; icon: React.ReactNode }> = {
    covered:      { label: 'Covered',        badge: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300',   rowBg: 'bg-green-50/30 dark:bg-green-900/5',  icon: <CheckCircle2 className="h-3 w-3" /> },
    conflict:     { label: 'Conflict',       badge: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',             rowBg: 'bg-red-50/30 dark:bg-red-900/5',      icon: <AlertTriangle className="h-3 w-3" /> },
    notConfigured:{ label: 'Not configured', badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',      rowBg: '',                                    icon: <MinusCircle className="h-3 w-3" /> },
};

const occurrenceStatusCfg = {
    match:    { short: 'Match',    badge: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300',  icon: <CheckCircle2 className="h-3 w-3" /> },
    conflict: { short: 'Conflict', badge: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',           icon: <AlertTriangle className="h-3 w-3" /> },
};

function ConfigCoverageRows({ settingAnalyses, policyKey, externalFilter }: {
    settingAnalyses: SettingAnalysis[];
    policyKey: string;
    externalFilter?: CoverageStatus | 'all';
}) {
    const [localFilter, setLocalFilter] = useState<CoverageStatus | 'all'>('all');
    const filter = externalFilter ?? localFilter;
    const setFilter = (f: CoverageStatus | 'all') => { if (!externalFilter) setLocalFilter(f); };
    const [search, setSearch] = useState('');
    const [sourceOnly, setSourceOnly] = useState(false);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const toggle = (id: string) => setExpanded(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });

    const counts = useMemo(() => {
        const c: Record<CoverageStatus, number> = { covered: 0, conflict: 0, notConfigured: 0 };
        settingAnalyses.forEach(sa => c[settingCoverageStatus(sa)]++);
        return c;
    }, [settingAnalyses]);

    const filtered = useMemo(() => settingAnalyses.filter(sa => {
        const status = settingCoverageStatus(sa);
        if (filter !== 'all' && status !== filter) return false;
        if (search && !sa.setting.displayName.toLowerCase().includes(search.toLowerCase()) &&
            !sa.setting.id.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [settingAnalyses, filter, search]);

    return (
        <div className="space-y-3 px-4 pb-4">
            {/* Summary strip */}
            <div className="flex items-center gap-5 flex-wrap text-xs bg-muted/10 rounded-lg px-3 py-2 border">
                {([
                    { k: 'covered',       label: 'Covered',        color: 'bg-green-500' },
                    { k: 'conflict',      label: 'Conflict',       color: 'bg-red-400' },
                    { k: 'notConfigured', label: 'Not in tenant',  color: 'bg-slate-400' },
                ] as { k: CoverageStatus; label: string; color: string }[]).map(x => (
                    <span key={x.k} className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-sm inline-block ${x.color}`} />
                        <span className="text-muted-foreground">{x.label}:</span>
                        <span className="font-semibold">{counts[x.k]}</span>
                    </span>
                ))}
                <span className="ml-auto text-muted-foreground">{settingAnalyses.length} settings</span>
            </div>

            {/* Filters + search */}
            <div className="flex items-center gap-2 flex-wrap">
                {!externalFilter && ([
                    ['all',           `All (${settingAnalyses.length})`],
                    ['covered',       `Covered (${counts.covered})`],
                    ['conflict',      `Conflict (${counts.conflict})`],
                    ['notConfigured', `Not in tenant (${counts.notConfigured})`],
                ] as [string, string][]).map(([f, lbl]) => (
                    <button key={f} onClick={() => setFilter(f as CoverageStatus | 'all')}
                        className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${filter === f ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-muted/50'}`}>
                        {lbl}
                    </button>
                ))}
                <div className="flex items-center gap-1.5 ml-auto">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-muted-foreground hover:text-foreground mr-3">
                        <input type="checkbox" checked={sourceOnly} onChange={e => setSourceOnly(e.target.checked)}
                            className="rounded border-input h-3.5 w-3.5 accent-primary" />
                        Source settings only
                    </label>
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                    <input type="text" placeholder="Search settings…" value={search} onChange={e => setSearch(e.target.value)}
                        className="border rounded px-2 py-1 text-xs bg-background w-44 outline-none focus:ring-1 focus:ring-primary/50" />
                    {search && <button onClick={() => setSearch('')}><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
                </div>
            </div>

            {/* Settings list */}
            <div className="rounded-lg border overflow-hidden">
                {/* Column header */}
                <div className="grid grid-cols-[auto_1fr_auto_auto] px-4 py-2 bg-muted/20 border-b text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span className="w-5" />
                    <span>Setting</span>
                    <span className="px-4 w-48">Uploaded value</span>
                    <span className="w-32 text-right">Status</span>
                </div>

                {filtered.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground">No settings match.</div>
                )}

                <div className="divide-y">
                    {filtered.map(sa => {
                        const status = settingCoverageStatus(sa);
                        const cfg = coverageStatusCfg[status];
                        const key = `${policyKey}__${sa.setting.id}`;
                        const isOpen = expanded.has(key);
                        const hasOccurrences = sa.occurrences.length > 0;

                        const uploadedDisplay = sa.setting.friendlyValue && sa.setting.friendlyValue !== sa.setting.value
                            ? sa.setting.friendlyValue
                            : (sa.setting.value.toLowerCase().startsWith(sa.setting.id.toLowerCase() + '_')
                                ? sa.setting.value.slice(sa.setting.id.length + 1)
                                : sa.setting.value);

                        return (
                            <div key={key} className={cfg.rowBg}>
                                {/* Setting header row */}
                                <div
                                    className={`grid grid-cols-[auto_1fr_auto_auto] px-4 py-3 items-center transition-colors ${hasOccurrences ? 'cursor-pointer hover:bg-black/2 dark:hover:bg-white/2' : ''}`}
                                    onClick={() => hasOccurrences && toggle(key)}
                                >
                                    <span className="w-5 shrink-0 text-muted-foreground">
                                        {hasOccurrences
                                            ? (isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />)
                                            : <span className="w-3.5 h-3.5 block" />}
                                    </span>
                                    <div className="min-w-0 pr-4">
                                        <p className="text-xs font-medium leading-snug">
                                            {sa.setting.displayName !== sa.setting.id ? sa.setting.displayName : humanizeSettingId(sa.setting.id)}
                                        </p>
                                        {sa.setting.displayName !== sa.setting.id && (
                                            <p className="font-mono text-[10px] text-muted-foreground/50 break-all leading-tight">{sa.setting.id}</p>
                                        )}
                                    </div>
                                    <span className="px-4 w-48 min-w-0 text-xs" onClick={e => e.stopPropagation()}>
                                        {uploadedDisplay
                                            ? <span className="font-medium">{uploadedDisplay}</span>
                                            : <span className="italic text-muted-foreground/50">—</span>}
                                    </span>
                                    <span className="w-32 flex justify-end shrink-0">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-medium ${cfg.badge}`}>
                                            {cfg.icon}{cfg.label}
                                        </span>
                                    </span>
                                </div>

                                {/* Expanded: tenant policy occurrences */}
                                {isOpen && hasOccurrences && (
                                    <div className="border-t bg-background/60 divide-y">
                                        {sa.occurrences.map((occ, j) => {
                                            const sc = occurrenceStatusCfg[occ.status];
                                            const tenantDisplay = occ.friendlyTenantValue && occ.friendlyTenantValue !== occ.tenantValue
                                                ? occ.friendlyTenantValue
                                                : (occ.tenantValue.toLowerCase().startsWith(sa.setting.id.toLowerCase() + '_')
                                                    ? occ.tenantValue.slice(sa.setting.id.length + 1)
                                                    : occ.tenantValue);

                                            return (
                                                <div key={j} className="text-xs">
                                                    <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-10 py-2 items-center">
                                                        <div className="min-w-0">
                                                            <span className="font-medium text-muted-foreground">{occ.tenantPolicy.name}</span>
                                                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                                {occ.tenantPolicy.platform && (
                                                                    <span className="text-[10px] text-muted-foreground/60">{occ.tenantPolicy.platform}</span>
                                                                )}
                                                                {occ.tenantPolicy.isAssigned && (
                                                                    <span className="text-[10px] px-1.5 py-0 rounded border bg-primary/10 text-primary border-primary/20 font-medium">Assigned</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="w-48 min-w-0 font-medium">
                                                            {tenantDisplay || <span className="italic text-muted-foreground/40">—</span>}
                                                        </span>
                                                        <span className="w-32 flex justify-end shrink-0">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-medium ${sc.badge}`}>
                                                                {sc.icon}{sc.short}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ── Per-tenant-policy result card (mirrors ResultCard in policies/page.tsx) ────

interface TenantPolicyRow {
    tenantPolicy: TenantPolicy;
    uploadedPolicyName: string;
    settings: {
        id: string;
        displayName: string;
        uploadedValue: string;
        uploadedFriendlyValue?: string;
        tenantValue: string;
        tenantFriendlyValue?: string;
        status: 'match' | 'conflict';
        childSettings?: NormalizedSetting['childSettings'];
    }[];
}

type ConfigRowFilter = 'all' | 'match' | 'conflict';

const configStateLabel: Record<'match' | 'conflict', string> = {
    match:    'Match',
    conflict: 'Conflict',
};

const configStateBadge: Record<'match' | 'conflict', string> = {
    match:    'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300',
    conflict: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300',
};

const configStateIcon: Record<'match' | 'conflict', React.ReactNode> = {
    match:    <CheckCircle2 className="h-3 w-3" />,
    conflict: <AlertTriangle className="h-3 w-3" />,
};

function smartPctCfg(count: number, total: number): string {
    if (total === 0) return '0%';
    if (count === 0) return '0%';
    const pct = (count / total) * 100;
    if (pct < 1) return '<1%';
    return `${Math.round(pct)}%`;
}

const ConfigResultCard = React.memo(function ConfigResultCard({ row }: { row: TenantPolicyRow }) {
    const [filter, setFilter] = useState<ConfigRowFilter>('all');
    const [search, setSearch] = useState('');
    const [expandedSettings, setExpandedSettings] = useState<Set<string>>(new Set());
    const [isExpanded, setIsExpanded] = useState(false);

    const total     = row.settings.length;
    const same      = row.settings.filter(s => s.status === 'match').length;
    const conflicts = row.settings.filter(s => s.status === 'conflict').length;
    const safePercent     = total === 0 ? 0 : Math.round((same / total) * 100);
    const conflictPercent = total === 0 ? 0 : Math.round((conflicts / total) * 100);

    const filtered = useMemo(() => row.settings.filter(s => {
        if (filter !== 'all' && s.status !== filter) return false;
        if (search && !s.displayName.toLowerCase().includes(search.toLowerCase()) &&
            !s.id.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [row.settings, filter, search]);

    const toggleSetting = (key: string) => setExpandedSettings(prev => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key); else next.add(key);
        return next;
    });

    const scoreColor = safePercent >= 80 ? 'text-green-600' : safePercent >= 50 ? 'text-amber-600' : 'text-red-600';
    const conflictColor = conflictPercent > 30 ? 'text-red-600' : conflictPercent > 0 ? 'text-amber-600' : 'text-muted-foreground';

    return (
        <Card className="overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors border-b"
                onClick={() => setIsExpanded(e => !e)}>
                {isExpanded
                    ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{row.tenantPolicy.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {total} settings compared ·{' '}
                        <span className={`font-medium ${scoreColor}`}>{safePercent}% match</span>
                        {conflicts > 0 && <span className={`ml-2 font-medium ${conflictColor}`}>· {conflicts} conflict{conflicts !== 1 ? 's' : ''}</span>}
                        {row.tenantPolicy.isAssigned && <span className="ml-2 text-primary font-medium">· Assigned</span>}
                    </p>
                </div>
                <div className="flex gap-3 text-xs shrink-0">
                    <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="h-3 w-3" />{same}</span>
                    {conflicts > 0 && <span className="flex items-center gap-1 text-red-600"><AlertTriangle className="h-3 w-3" />{conflicts}</span>}
                </div>
            </div>

            {isExpanded && (
                <CardContent className="pt-0 pb-4 px-0">
                    {/* KPI pills */}
                    <div className="px-4 py-3 grid grid-cols-2 md:grid-cols-3 gap-3 border-b">
                        {[
                            { label: 'Match',    count: same,      pct: smartPctCfg(same, total),      bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800', cls: 'text-green-600 dark:text-green-400' },
                            { label: 'Conflict', count: conflicts,  pct: smartPctCfg(conflicts, total), bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',         cls: 'text-red-600 dark:text-red-400' },
                            { label: 'Total',    count: total,      pct: '100%',                        bg: 'bg-muted border-border',                                                   cls: 'text-muted-foreground' },
                        ].map(k => (
                            <div key={k.label} className={`rounded-lg border px-3 py-2 text-center ${k.bg}`}>
                                <p className={`text-xl font-bold ${k.cls}`}>{k.count}</p>
                                <p className={`text-[10px] font-medium ${k.cls}`}>{k.label}</p>
                                <p className="text-[10px] text-muted-foreground">{k.pct}</p>
                            </div>
                        ))}
                    </div>

                    {/* Coverage bar */}
                    <div className="px-4 py-2 border-b space-y-1">
                        <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-muted">
                            {safePercent > 0     && <div className="bg-green-500 h-full" style={{ width: `${safePercent}%` }} />}
                            {conflictPercent > 0 && <div className="bg-red-400 h-full"   style={{ width: `${conflictPercent}%` }} />}
                        </div>
                        <div className="flex gap-3 text-[10px] text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-green-500" />Match {safePercent}%</span>
                            {conflictPercent > 0 && <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-red-400" />Conflict {conflictPercent}%</span>}
                        </div>
                    </div>

                    {/* Policy labels */}
                    <div className="px-4 py-3 grid grid-cols-2 gap-3 border-b">
                        <div className="bg-blue-50 dark:bg-blue-950/50 p-2.5 rounded border-l-4 border-blue-400">
                            <p className="text-[10px] text-blue-600 font-medium uppercase">Uploaded policy</p>
                            <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mt-0.5">{row.uploadedPolicyName}</p>
                        </div>
                        <div className="bg-muted p-2.5 rounded border-l-4 border-border">
                            <p className="text-[10px] text-muted-foreground font-medium uppercase">Tenant policy</p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <p className="text-xs font-medium">{row.tenantPolicy.name}</p>
                                {row.tenantPolicy.isAssigned && (
                                    <span className="text-[10px] px-1.5 py-0 rounded border bg-primary/10 text-primary border-primary/20 font-medium">Assigned</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Filters + search */}
                    <div className="px-4 py-3 flex items-center gap-2 flex-wrap border-b">
                        {(['all', 'match', 'conflict'] as const).map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${filter === f ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-muted/50'}`}>
                                {f === 'all' ? `All (${total})` : `${configStateLabel[f]} (${f === 'match' ? same : conflicts})`}
                            </button>
                        ))}
                        <div className="flex items-center gap-1.5 ml-auto">
                            <Search className="h-3.5 w-3.5 text-muted-foreground" />
                            <input type="text" placeholder="Search settings…" value={search} onChange={e => setSearch(e.target.value)}
                                className="border rounded px-2 py-1 text-xs bg-background w-44 focus:ring-1 focus:ring-primary/50 outline-none" />
                            {search && <button onClick={() => setSearch('')}><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
                        </div>
                    </div>

                    {/* Column headers */}
                    <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 px-4 py-2 bg-muted/10 text-xs font-medium text-muted-foreground border-b">
                        <span>Setting</span>
                        <span>Uploaded value</span>
                        <span>Tenant value</span>
                        <span className="w-28 text-right">Status</span>
                    </div>

                    {filtered.length === 0
                        ? <div className="p-6 text-center text-sm text-muted-foreground">No settings match current filter.</div>
                        : (
                            <div className="divide-y">
                                {filtered.map((s, i) => {
                                    const key = `${row.tenantPolicy.id}__${s.id}__${i}`;
                                    const isSettingExpanded = expandedSettings.has(key);
                                    const hasChildren = (s.childSettings?.length ?? 0) > 0;
                                    const rowBg = s.status === 'match'
                                        ? 'bg-green-50/30 dark:bg-green-900/10'
                                        : 'bg-red-50/30 dark:bg-red-900/10';

                                    const uploadedDisplay = s.uploadedFriendlyValue && s.uploadedFriendlyValue !== s.uploadedValue
                                        ? s.uploadedFriendlyValue
                                        : (s.uploadedValue.toLowerCase().startsWith(s.id.toLowerCase() + '_')
                                            ? s.uploadedValue.slice(s.id.length + 1)
                                            : s.uploadedValue);

                                    const tenantDisplay = s.tenantFriendlyValue && s.tenantFriendlyValue !== s.tenantValue
                                        ? s.tenantFriendlyValue
                                        : (s.tenantValue.toLowerCase().startsWith(s.id.toLowerCase() + '_')
                                            ? s.tenantValue.slice(s.id.length + 1)
                                            : s.tenantValue);

                                    return (
                                        <div key={i}>
                                            <div className={`grid grid-cols-[2fr_1fr_1fr_auto] gap-2 px-4 py-2.5 items-start cursor-pointer hover:bg-muted/10 ${rowBg}`}
                                                onClick={() => toggleSetting(key)}>
                                                <div className="flex items-start gap-2 min-w-0">
                                                    {isSettingExpanded
                                                        ? <ChevronDown className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                                                        : <ChevronRight className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />}
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-medium leading-snug">
                                                            {s.displayName !== s.id ? s.displayName : humanizeSettingId(s.id)}
                                                        </p>
                                                        {s.displayName !== s.id && (
                                                            <p className="font-mono text-[10px] text-muted-foreground/50 break-all leading-tight">{s.id}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-xs min-w-0">
                                                    {uploadedDisplay
                                                        ? <span className="font-medium">{uploadedDisplay}</span>
                                                        : <span className="italic text-muted-foreground/50">—</span>}
                                                </div>
                                                <div className="text-xs min-w-0">
                                                    {tenantDisplay
                                                        ? <span className={s.status === 'conflict' ? 'font-medium text-red-700 dark:text-red-400' : 'font-medium'}>{tenantDisplay}</span>
                                                        : <span className="italic text-muted-foreground/50">—</span>}
                                                </div>
                                                <div className="w-28 flex justify-end shrink-0">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-medium ${configStateBadge[s.status]}`}>
                                                        {configStateIcon[s.status]}{configStateLabel[s.status]}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Expanded: child settings */}
                                            {isSettingExpanded && hasChildren && (
                                                <div className={`border-t bg-muted/5 ${rowBg}`}>
                                                    <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 px-9 py-1.5 text-[10px] font-medium text-muted-foreground bg-muted/20 border-b">
                                                        <span>Child setting</span><span>Uploaded</span><span>Tenant</span><span className="w-28" />
                                                    </div>
                                                    {s.childSettings!.map((child, ci) => (
                                                        <div key={ci} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 px-9 py-2 text-xs items-start border-b last:border-b-0">
                                                            <span className="font-medium">{child.name}</span>
                                                            <span>{child.value || <span className="italic text-muted-foreground/50">—</span>}</span>
                                                            <span className="italic text-muted-foreground/50">—</span>
                                                            <span className="w-28" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                </CardContent>
            )}
        </Card>
    );
});

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
    const [loadingPhase, setLoadingPhase] = useState<'idle' | 'fetching' | 'resolving'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'detail' | 'perPolicy'>('detail');
    const [globalCoverageFilter, setGlobalCoverageFilter] = useState<CoverageStatus | 'all'>('all');
    const [uploadCollapsed, setUploadCollapsed] = useState(false);
    const [filesListCollapsed, setFilesListCollapsed] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    // ── Derived analyses via useMemo ──────────────────────────────────────────
    const analyses = useMemo<PolicyAnalysis[]>(() => {
        if (!hasFetched || !uploadedPolicies.length) return [];
        return uploadedPolicies.map(uploaded => {
            const tenantPolicies = tenantPoliciesCache.get(uploaded.kind) ?? [];
            const analysis = analyzePolicy(uploaded, tenantPolicies);

            // Enrich settings with resolved definitions (missing + non-missing with option-ID values)
            if (resolvedDefinitionsCache.size === 0) return analysis;

            const enrichedSettingAnalyses = analysis.settingAnalyses.map(sa => {
                const resolved = resolvedDefinitionsCache.get(sa.setting.id.toLowerCase());
                if (!resolved) return sa;

                // Build option map: full itemId (lower) → displayName
                const optionMap = new Map<string, string>();
                resolved.options?.forEach(o => optionMap.set(o.itemId.toLowerCase(), o.displayName));

                // Resolve friendly value from options map
                const rawLower = sa.setting.value.toLowerCase();
                const suffix = rawLower.startsWith(sa.setting.id.toLowerCase() + '_')
                    ? sa.setting.value.slice(sa.setting.id.length + 1)
                    : null;
                const resolvedFriendlyValue =
                    optionMap.get(rawLower)                                       // exact full itemId → displayName e.g. "Enabled"
                    ?? (suffix ? optionMap.get(suffix.toLowerCase()) : undefined) // bare suffix → displayName
                    ?? suffix                                                      // bare suffix as last resort e.g. "1"
                    ?? undefined;

                // Always prefer a proper displayName from the options map over a bare suffix.
                // e.g. replace "1" with "Enabled" when the map has a better label.
                const currentFriendly = sa.setting.friendlyValue;
                const isBareShortSuffix = currentFriendly !== undefined && /^[\w]{1,5}$/.test(currentFriendly);
                const friendlyValue =
                    resolvedFriendlyValue && resolvedFriendlyValue !== sa.setting.value &&
                    (!currentFriendly || isBareShortSuffix || currentFriendly === resolvedFriendlyValue)
                        ? resolvedFriendlyValue
                        : currentFriendly;

                // Only update displayName for missing settings (non-missing already have it from tenant)
                const displayName = sa.isMissing ? resolved.displayName : sa.setting.displayName;

                if (friendlyValue === sa.setting.friendlyValue && displayName === sa.setting.displayName) return sa;
                return {
                    ...sa,
                    setting: { ...sa.setting, displayName, friendlyValue },
                };
            });
            return { ...analysis, settingAnalyses: enrichedSettingAnalyses };
        });
    }, [uploadedPolicies, tenantPoliciesCache, resolvedDefinitionsCache, hasFetched]);

    // ── Per-tenant-policy inversion ───────────────────────────────────────────
    const perPolicyRows = useMemo((): TenantPolicyRow[] => {
        const map = new Map<string, TenantPolicyRow>();
        for (const analysis of analyses) {
            for (const sa of analysis.settingAnalyses) {
                if (sa.isMissing) continue; // missing = no tenant policy occurrence
                for (const occ of sa.occurrences) {
                    const pKey = occ.tenantPolicy.id;
                    if (!map.has(pKey)) {
                        map.set(pKey, {
                            tenantPolicy: occ.tenantPolicy,
                            uploadedPolicyName: analysis.uploadedPolicy.name,
                            settings: [],
                        });
                    }
                    map.get(pKey)!.settings.push({
                        id: sa.setting.id,
                        displayName: sa.setting.displayName,
                        uploadedValue: sa.setting.value,
                        uploadedFriendlyValue: sa.setting.friendlyValue,
                        tenantValue: occ.tenantValue,
                        tenantFriendlyValue: occ.friendlyTenantValue,
                        status: occ.status,
                        childSettings: sa.setting.childSettings,
                    });
                }
            }
        }
        // Sort: assigned first, then by conflict count desc
        return [...map.values()].sort((a, b) => {
            if (b.tenantPolicy.isAssigned !== a.tenantPolicy.isAssigned)
                return b.tenantPolicy.isAssigned ? 1 : -1;
            const aConflicts = a.settings.filter(s => s.status === 'conflict').length;
            const bConflicts = b.settings.filter(s => s.status === 'conflict').length;
            return bConflicts - aConflicts;
        });
    }, [analyses]);

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
                    resolve({ fileName: file.name, raw: {}, kind: 'Unknown', name: file.name, platform: '', odataType: '', settings: [], definitionMap: new Map(), error: 'Invalid JSON' });
                }
            };
            reader.readAsText(file);
        }));
        Promise.all(readers).then(newPolicies => {
            setUploadedPolicies(prev => {
                const existingNames = new Set(prev.map(p => p.fileName));
                return [...prev, ...newPolicies.filter(p => !existingNames.has(p.fileName))];
            });
            setFilesListCollapsed(true);
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
    const cancelFetch = () => {
        abortRef.current?.abort();
        abortRef.current = null;
        setLoading(false);
        setLoadingPhase('idle');
    };

    const fetchTenantData = async (clearCache = false) => {
        if (!uploadedPolicies.length || !accounts.length) return;

        // Cancel any in-flight request
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setLoadingPhase('fetching');
        setError(null);

        const cache: Map<PolicyKind, TenantPolicy[]> = clearCache ? new Map() : new Map(tenantPoliciesCache);
        const kinds = new Set(uploadedPolicies.map(p => p.kind).filter(k => k !== 'Unknown') as PolicyKind[]);
        const toFetch = [...kinds].filter(k => !cache.has(k));

        try {
            await Promise.all(toFetch.map(async kind => {
                if (controller.signal.aborted) return;
                const endpoint = endpointForKind(kind);
                if (!endpoint) return;
                try {
                    const response = await request<ApiResponse>(endpoint, { method: 'GET', signal: controller.signal });
                    cache.set(kind, response?.data?.data ?? []);
                } catch (e) {
                    if ((e as Error)?.name === 'AbortError') throw e;
                    cache.set(kind, []);
                }
            }));

            if (controller.signal.aborted) return;

            setTenantPoliciesCache(cache);
            setHasFetched(true);
            setUploadCollapsed(true);
            setExpandedPolicies(new Set(uploadedPolicies.map(p => p.fileName)));

            // ── Resolve setting definitions (missing + any with option-ID values) ──
            const quickAnalyses = uploadedPolicies.map(uploaded => {
                const tenantPolicies = cache.get(uploaded.kind) ?? [];
                return analyzePolicy(uploaded, tenantPolicies);
            });
            const settingIdsToResolve = new Set<string>();
            for (const a of quickAnalyses) {
                for (const sa of a.settingAnalyses) {
                    // Always resolve missing settings
                    if (sa.isMissing) {
                        settingIdsToResolve.add(sa.setting.id);
                        continue;
                    }
                    // Also resolve when the uploaded value looks like a full option item ID
                    // (starts with settingId + '_') — even if a bare suffix is already set,
                    // we want the proper displayName (e.g. "Enabled") not just "1"
                    if (sa.setting.value.toLowerCase().startsWith(sa.setting.id.toLowerCase() + '_')) {
                        settingIdsToResolve.add(sa.setting.id);
                    }
                }
            }

            const existingCache = clearCache ? new Map<string, ResolvedDefinition>() : new Map(resolvedDefinitionsCache);
            const toResolve = [...settingIdsToResolve].filter(id => !existingCache.has(id.toLowerCase()));

            if (toResolve.length > 0 && !controller.signal.aborted) {
                setLoadingPhase('resolving');
                try {
                    const resolveResponse = await request<ResolveApiResponse>(
                        SETTINGS_DEFINITIONS_RESOLVE_ENDPOINT,
                        { method: 'POST', body: JSON.stringify(toResolve), signal: controller.signal }
                    );
                    if (!controller.signal.aborted) {
                        const definitions: ResolvedDefinition[] = resolveResponse?.data?.data ?? [];
                        for (const def of definitions) {
                            existingCache.set(def.id.toLowerCase(), def);
                        }
                        setResolvedDefinitionsCache(new Map(existingCache));
                    }
                } catch (e) {
                    if ((e as Error)?.name !== 'AbortError') {
                        // resolve failed silently — analyses still work without friendly names
                    }
                }
            }
        } catch (err) {
            if ((err as Error)?.name !== 'AbortError') {
                setError(err instanceof Error ? err.message : 'Fetch failed');
            }
        } finally {
            if (!controller.signal.aborted) {
                abortRef.current = null;
                setLoading(false);
                setLoadingPhase('idle');
            }
        }
    };

    // ── UI helpers ────────────────────────────────────────────────────────────
    const togglePolicy = (key: string) => setExpandedPolicies(prev => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key); else next.add(key);
        return next;
    });

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
                        {loading ? (
                            <Button variant="outline" size="sm" onClick={cancelFetch} className="border-destructive/50 text-destructive hover:bg-destructive/10 gap-1.5">
                                <XCircle className="h-4 w-4" />
                                Cancel
                            </Button>
                        ) : (
                            <Button variant="outline" size="sm" onClick={() => fetchTenantData(true)} disabled={loading}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh Tenant Data
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={exportResults} disabled={loading}>
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                )}
            </div>

            {/* Upload Zone */}
            <Card>
                <CardHeader
                    className="cursor-pointer select-none"
                    onClick={() => setUploadCollapsed(c => !c)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                                {uploadCollapsed ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                Upload Policy Files
                                {uploadCollapsed && uploadedPolicies.length > 0 && (
                                    <span className="ml-2 flex gap-1.5 flex-wrap">
                                        {uploadedPolicies.map(p => (
                                            <Badge key={p.fileName} className={`text-xs ${kindColor[p.kind]}`}>{p.name}</Badge>
                                        ))}
                                    </span>
                                )}
                            </CardTitle>
                            {!uploadCollapsed && (
                                <CardDescription className="mt-1">
                                    Drop exported Intune policy JSON files. Policy type and platform are auto-detected. Tenant data
                                    is fetched once and reused — use <strong>Refresh Tenant Data</strong> to re-fetch.
                                </CardDescription>
                            )}
                        </div>
                    </div>
                </CardHeader>
                {!uploadCollapsed && (
                <CardContent className="space-y-4">
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'}`}
                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                        <Upload className={`h-10 w-10 mx-auto mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="font-medium text-sm">{isDragging ? 'Drop files here' : 'Click or drag & drop JSON files here'}</p>
                        <p className="text-xs text-muted-foreground mt-1">Supports multiple files. JSON format only.</p>
                        <input ref={fileInputRef} type="file" accept=".json" multiple className="hidden" onChange={handleFileChange} />
                    </div>

                    {uploadedPolicies.length > 0 && (
                        <div className="space-y-1.5">
                            {/* Collapsible header */}
                            <button
                                type="button"
                                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full text-left"
                                onClick={e => { e.stopPropagation(); setFilesListCollapsed(c => !c); }}
                            >
                                {filesListCollapsed
                                    ? <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                                    : <ChevronDown className="h-3.5 w-3.5 shrink-0" />}
                                {uploadedPolicies.length} file{uploadedPolicies.length !== 1 ? 's' : ''} loaded
                                {filesListCollapsed && (
                                    <span className="flex gap-1 ml-1 flex-wrap">
                                        {uploadedPolicies.map(p => (
                                            <Badge key={p.fileName} className={`text-xs ${kindColor[p.kind]}`}>{p.name}</Badge>
                                        ))}
                                    </span>
                                )}
                            </button>

                            {/* File rows */}
                            {!filesListCollapsed && uploadedPolicies.map(policy => (
                                <div key={policy.fileName} className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/20">
                                    <FileJson className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-sm truncate">{policy.name}</span>
                                            <Badge className={`text-xs ${kindColor[policy.kind]}`}>{kindLabel[policy.kind]}</Badge>
                                            {policy.platform && <Badge variant="outline" className="text-xs">{policy.platform}</Badge>}
                                            {policy.error && <Badge variant="destructive" className="text-xs">{policy.error}</Badge>}
                                            <span className="text-xs text-muted-foreground">{policy.settings.length} settings</span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0" onClick={e => { e.stopPropagation(); removeUploadedPolicy(policy.fileName); }}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                        <Button onClick={() => fetchTenantData(false)} disabled={!uploadedPolicies.length || loading || !accounts.length} className="gap-2">
                            <Search className="h-4 w-4" />
                            {hasFetched ? 'Re-run Analysis' : 'Compare Against Tenant'}
                        </Button>
                        {uploadedPolicies.length > 0 && (
                            <Button variant="outline" size="sm" onClick={() => { setUploadedPolicies([]); setHasFetched(false); setResolvedDefinitionsCache(new Map()); setUploadCollapsed(false); }}>
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
                )}
            </Card>

            {/* Loading banner with cancel */}
            {loading && loadingPhase !== 'idle' && (
                <LoadingBanner phase={loadingPhase} onCancel={cancelFetch} />
            )}

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
                        {(['detail', 'perPolicy'] as const).map(tab => (
                            <button key={tab}
                                className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === 'detail'
                                    ? <><Layers className="h-4 w-4 inline mr-1" />Coverage</>
                                    : <><ShieldCheck className="h-4 w-4 inline mr-1" />Per-Policy Detail</>}
                            </button>
                        ))}
                    </div>

                    {/* ── PER-POLICY DETAIL TAB ── */}
                    {activeTab === 'perPolicy' && (
                        <div className="space-y-4">
                            {perPolicyRows.length === 0 ? (
                                <Card>
                                    <CardContent className="p-8 text-center text-sm text-muted-foreground">
                                        No tenant policies matched. Run the analysis first.
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    <p className="text-xs text-muted-foreground">
                                        {perPolicyRows.length} tenant {perPolicyRows.length === 1 ? 'policy' : 'policies'} matched ·
                                        assigned policies shown first · sorted by conflict count
                                    </p>
                                    {perPolicyRows.map(row => (
                                        <ConfigResultCard key={row.tenantPolicy.id} row={row} />
                                    ))}
                                </>
                            )}
                        </div>
                    )}

                    {/* ── DETAIL TAB ── */}
                    {activeTab === 'detail' && (
                        <div className="space-y-4">
                            {/* Global filter bar */}
                            {(() => {
                                const allSettings = analyses.flatMap(a => a.settingAnalyses);
                                const totalAll     = allSettings.length;
                                const totalCovered = allSettings.filter(sa => settingCoverageStatus(sa) === 'covered').length;
                                const totalConflict = allSettings.filter(sa => settingCoverageStatus(sa) === 'conflict').length;
                                const totalMissing = allSettings.filter(sa => settingCoverageStatus(sa) === 'notConfigured').length;
                                return (
                                    <div className="flex items-center gap-2 flex-wrap p-3 bg-muted/20 rounded-lg border">
                                        <span className="text-xs font-medium text-muted-foreground mr-1">Show:</span>
                                        {([
                                            ['all',           `All (${totalAll})`,                  ''],
                                            ['covered',       `Covered (${totalCovered})`,        'text-green-700 dark:text-green-300'],
                                            ['conflict',      `Conflict (${totalConflict})`,      'text-red-700 dark:text-red-300'],
                                            ['notConfigured', `Not in tenant (${totalMissing})`,  'text-slate-600 dark:text-slate-300'],
                                        ] as [string, string, string][]).map(([f, lbl, cls]) => (
                                            <button key={f}
                                                onClick={() => setGlobalCoverageFilter(f as CoverageStatus | 'all')}
                                                className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${globalCoverageFilter === f ? 'bg-primary text-primary-foreground border-primary' : `border-input hover:bg-muted/50 ${cls}`}`}>
                                                {lbl}
                                            </button>
                                        ))}
                                        {globalCoverageFilter !== 'all' && (
                                            <button onClick={() => setGlobalCoverageFilter('all')}
                                                className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                                                <X className="h-3.5 w-3.5" />Clear filter
                                            </button>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Per-policy cards */}
                            {analyses.map(analysis => {
                                const isExpanded = globalCoverageFilter !== 'all'
                                    ? true  // auto-expand when a filter is active
                                    : expandedPolicies.has(analysis.uploadedPolicy.fileName);

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
                                            <CardContent className="pt-0 pb-0 px-0">
                                                {analysis.summary.platformMatchedPolicyCount === 0 ? (
                                                    <div className="mx-4 mb-4 rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                                                        <MinusCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                        <p className="text-sm">No tenant policies matched platform <strong>{analysis.uploadedPolicy.platform || '(unknown)'}</strong>.</p>
                                                        <p className="text-xs mt-1">All {analysis.summary.totalTenantPoliciesOfKind} tenant {kindLabel[analysis.uploadedPolicy.kind]} policies were excluded.</p>
                                                    </div>
                                                ) : (
                                                    <ConfigCoverageRows
                                                        settingAnalyses={analysis.settingAnalyses}
                                                        policyKey={analysis.uploadedPolicy.fileName}
                                                        externalFilter={globalCoverageFilter !== 'all' ? globalCoverageFilter : undefined}
                                                    />
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

