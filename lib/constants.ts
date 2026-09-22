export const API_BASE_PRD_URL = 'https://api.intuneassistant.cloud/v1';
export const API_BASE_TST_URL = 'https://intuneassistant-api-test.azurewebsites.net/v1';
export const API_BASE_DEV_URL = 'https://localhost:7224/v1';

// Choose env var name: APP_ENV (build-time). Use NEXT_PUBLIC_APP_ENV if you need client runtime access.
const APP_ENV = process.env.APP_ENV || process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV;
export const API_BASE_URL =
    APP_ENV === 'test'
        ? API_BASE_TST_URL
        : APP_ENV === 'development' || process.env.NODE_ENV === 'development'
            ? API_BASE_DEV_URL
            : API_BASE_PRD_URL;

export const VERSION_ENDPOINT = `${API_BASE_URL}/version`;

// Onboarding: the consent URL and callback are GET requests; creating the account (POST) is the only
// write this app makes, and it is allow-listed in lib/apiRequest.ts.
export const CUSTOMER_ENDPOINT = `${API_BASE_URL}/customer`;
export const CONSENT_URL_ENDPOINT = `${API_BASE_URL}/consent/build-url`;
export const CONSENT_CALLBACK = `${API_BASE_URL}/consent/callback`;
export const IA_VERIFY_ENDPOINT = `${API_BASE_URL}/consent/intuneassistant-verify`;

// Assignments
export const ASSIGNMENTS_ENDPOINT = `${API_BASE_URL}/assignments`;
export const ASSIGNMENTS_FILTERS_ENDPOINT = `${API_BASE_URL}/assignments/filters`;
export const ASSIGNMENTS_GROUP_FILTER_ANALYSIS_ENDPOINT = `${API_BASE_URL}/assignments/groups`; // append /{groupId}/filter-analysis
export const ROLE_SCOPETAGS_ENDPOINT = `${API_BASE_URL}/roles/scopeTags`;

// Directory
export const USERS_ENDPOINT = `${API_BASE_URL}/user`;
export const GROUPS_ENDPOINT = `${API_BASE_URL}/groups`;
export const GROUPS_LIST_ENDPOINT = `${API_BASE_URL}/groups/list`;

// Devices
export const DEVICES_ENDPOINT = `${API_BASE_URL}/devices`;
export const DEVICES_STATS_ENDPOINT = `${DEVICES_ENDPOINT}/stats`;
export const DEVICES_COMPARE_ENDPOINT = `${DEVICES_ENDPOINT}/compare`;
export const DEVICES_DUPLICATES_ENDPOINT = `${DEVICES_ENDPOINT}/duplicates`;
export const DEVICES_DUPLICATE_GROUP_ENDPOINT = (groupId: string) => `${DEVICES_DUPLICATES_ENDPOINT}/${groupId}`;

// Policies
export const POLICIES_ENDPOINT = `${API_BASE_URL}/policies`;
export const CONFIGURATION_POLICIES_ENDPOINT = `${POLICIES_ENDPOINT}/configuration`;
export const CA_POLICIES_ENDPOINT = `${POLICIES_ENDPOINT}/ca`;
export const POLICY_SETTINGS_ANALYSIS_ENDPOINT = `${POLICIES_ENDPOINT}/settings/analysis`;

// Compare — free, RequireActiveCustomer only (no module gate). ComparePolicies/FromJson/SetAnalysis
// are all read-only: `DeviceManagementConfiguration.Read.All` scope only, and the orchestrator only
// ever calls Get*/audit-log, confirmed against IntuneAssistant.API/Controllers/Comparator/PolicyCompareController.cs.
// POST is only how the compare parameters (policy ids, or a pasted JSON payload) travel — allowlisted
// in lib/apiRequest.ts. "Compare External" (app/compare/configuration in the reference app) is NOT
// restored here — it's a much larger, separately-scoped page that wasn't verified in this pass.
export const COMPARE_ENDPOINT = `${API_BASE_URL}/compare`;
export const COMPARE_SET_ANALYSIS_ENDPOINT = (policyType: string) => `${COMPARE_ENDPOINT}/${policyType}/set-analysis`;
export const SETTINGS_DEFINITIONS_RESOLVE_ENDPOINT = `${API_BASE_URL}/settings/definitions/resolve`;

// Checks
export const GROUP_FILTER_ANALYZER_ENDPOINT = `${API_BASE_URL}/analyzer/group-filter`;
export const RBAC_ANALYSIS_ENDPOINT = `${API_BASE_URL}/rbac/analysis`;
export const SERVICE_ANNOUNCEMENTS_MESSAGES_ENDPOINT = `${API_BASE_URL}/service-announcements/messages`;

// Settings Library — free Intune platform metadata, no module entitlement required. Search, browse,
// history, dependency graph, changelog and baseline coverage are all GET. `ingest`/`relations/discover`
// are platform-admin-only writes to shared catalog data and are deliberately not wired up here.
export const SETTINGS_LIBRARY_ENDPOINT = `${API_BASE_URL}/settings-library`;
export const SETTINGS_LIBRARY_SETTINGS_ENDPOINT = `${SETTINGS_LIBRARY_ENDPOINT}/settings`;
export const SETTINGS_LIBRARY_SETTINGS_STREAM_ENDPOINT = `${SETTINGS_LIBRARY_SETTINGS_ENDPOINT}/stream`;
export const SETTINGS_LIBRARY_SETTING_DETAIL_ENDPOINT = (id: string) => `${SETTINGS_LIBRARY_SETTINGS_ENDPOINT}/${id}`;
export const SETTINGS_LIBRARY_SETTING_HISTORY_ENDPOINT = (id: string) => `${SETTINGS_LIBRARY_SETTINGS_ENDPOINT}/${id}/history`;
export const SETTINGS_LIBRARY_SETTING_GRAPH_ENDPOINT = (id: string) => `${SETTINGS_LIBRARY_SETTINGS_ENDPOINT}/${id}/graph`;
export const SETTINGS_LIBRARY_GRAPH_ENDPOINT = `${SETTINGS_LIBRARY_ENDPOINT}/graph`;
export const SETTINGS_LIBRARY_EXPLORE_ENDPOINT = `${SETTINGS_LIBRARY_ENDPOINT}/explore`;
export const SETTINGS_LIBRARY_SETTING_CONTEXT_ENDPOINT = (id: string) => `${SETTINGS_LIBRARY_SETTINGS_ENDPOINT}/${id}/context`;
export const SETTINGS_LIBRARY_GRAPH_SUMMARY_ENDPOINT = `${SETTINGS_LIBRARY_GRAPH_ENDPOINT}/summary`;
export const SETTINGS_LIBRARY_TENANT_USAGE_SUMMARY_ENDPOINT = `${SETTINGS_LIBRARY_ENDPOINT}/tenant-usage/summary`;
export const SETTINGS_LIBRARY_TENANT_USAGE_SESSION_ENDPOINT = `${SETTINGS_LIBRARY_ENDPOINT}/tenant-usage/session`;
export const SETTINGS_LIBRARY_TENANT_USAGE_HARVEST_STREAM_ENDPOINT = `${SETTINGS_LIBRARY_ENDPOINT}/tenant-usage/harvest/stream`;
export const SETTINGS_LIBRARY_SETTING_TENANT_USAGE_ENDPOINT = (id: string) => `${SETTINGS_LIBRARY_SETTINGS_ENDPOINT}/${id}/tenant-usage`;
export const SETTINGS_LIBRARY_TENANT_IMPACT_ENDPOINT = `${SETTINGS_LIBRARY_ENDPOINT}/tenant-usage/impact`;
export const SETTINGS_LIBRARY_TENANT_USAGE_EXPORT_ENDPOINT = `${SETTINGS_LIBRARY_ENDPOINT}/tenant-usage/export`;
export const SETTINGS_LIBRARY_SETTING_BY_DEFINITION_ENDPOINT = (definitionId: string) =>
    `${SETTINGS_LIBRARY_SETTINGS_ENDPOINT}/by-definition-id/${encodeURIComponent(definitionId)}`;
export const SETTINGS_LIBRARY_CHANGES_ENDPOINT = `${SETTINGS_LIBRARY_ENDPOINT}/changes`;
export const SETTINGS_LIBRARY_CHANGES_SUMMARY_ENDPOINT = `${SETTINGS_LIBRARY_ENDPOINT}/changes/summary`;
export const SETTINGS_LIBRARY_SNAPSHOTS_ENDPOINT = `${SETTINGS_LIBRARY_ENDPOINT}/snapshots`;
export const SETTINGS_LIBRARY_CATEGORIES_ENDPOINT = `${SETTINGS_LIBRARY_ENDPOINT}/categories`;
export const SETTINGS_LIBRARY_COMPARE_ENDPOINT = `${SETTINGS_LIBRARY_ENDPOINT}/compare`;

// Baseline Library — Microsoft's security baseline templates, tracked across versions. Same free,
// no-module-entitlement shape as Settings Library: templates, history, compare and coverage are all
// GET. `ingest` is a platform-admin-only write to shared catalog data and is deliberately not wired
// up here.
export const BASELINE_LIBRARY_ENDPOINT = `${API_BASE_URL}/baseline-library`;
export const BASELINE_LIBRARY_CHANGES_ENDPOINT = `${BASELINE_LIBRARY_ENDPOINT}/changes`;
export const BASELINE_LIBRARY_TEMPLATES_ENDPOINT = `${BASELINE_LIBRARY_ENDPOINT}/templates`;
export const BASELINE_LIBRARY_FAMILY_HISTORY_ENDPOINT = (familyId: string) => `${BASELINE_LIBRARY_TEMPLATES_ENDPOINT}/${familyId}/history`;
export const BASELINE_LIBRARY_FAMILY_COMPARE_ENDPOINT = (familyId: string) => `${BASELINE_LIBRARY_TEMPLATES_ENDPOINT}/${familyId}/compare`;
export const BASELINE_LIBRARY_COVERAGE_ENDPOINT = `${BASELINE_LIBRARY_ENDPOINT}/coverage`;
export const BASELINE_LIBRARY_FAMILY_COVERAGE_ENDPOINT = (familyId: string) => `${BASELINE_LIBRARY_TEMPLATES_ENDPOINT}/${familyId}/coverage`;

// Audit Events (Intune) — free, no module entitlement required. `/page` covers date+category via
// querystring; `/filter` is a verified read-only POST (see lib/apiRequest.ts) only for the extra
// activityType/actor/result filters that don't fit a querystring.
export const AUDIT_LOGS_INTUNE_EVENTS = `${API_BASE_URL}/audit/intune/page`;
export const AUDIT_LOGS_INTUNE_FILTER = `${API_BASE_URL}/audit/intune/filter`;
export const AUDIT_LOGS_INTUNE_DETAIL_ENDPOINT = (id: string) => `${API_BASE_URL}/audit/intune/${id}`;

// Backup — free, read-only export of Intune configuration (list/export/fetch only read from Graph
// and stream the JSON back; no Blob writes, no tenant writes). Restore is a real write gated behind
// the paid config_management module and is deliberately not part of this community app.
export const BACKUP_EXPORT_ENDPOINT = (resourceType: string) => `${API_BASE_URL}/backup/export/${resourceType}`;
export const BACKUP_LIST_ENDPOINT = (resourceType: string) => `${API_BASE_URL}/backup/list/${resourceType}`;
export const BACKUP_FETCH_ENDPOINT = (resourceType: string) => `${API_BASE_URL}/backup/fetch/${resourceType}`;

// Tenant Overview — live SSE stream (GET) that collects every resource family once at sign-in and
// caches it, powering the global Cmd/Ctrl+K search and the /overview page. Available to every
// connected account here, but the backend endpoint still carries
// [Authorize(Policy = "RequireBetaTester")] — a per-customer flag this app cannot grant — so most
// accounts currently get a 403, which contexts/TenantOverviewContext.tsx treats as quietly idle
// rather than a visible failure. See IntuneAssistant.Docs/private/todo-list.md for the backend
// follow-up to revisit that policy. Change history (the stream's `changes` event and
// TenantOverviewChangesController's `v1/overview/changes*`) is on top of that a paid Configuration
// Management feature and is deliberately not ported here.
export const TENANT_OVERVIEW_STREAM_ENDPOINT = `${API_BASE_URL}/overview/stream`;
export const TENANT_OVERVIEW_CACHE_TTL_MS = 30 * 60 * 1000;

export const ITEMS_PER_PAGE = 25;

// localStorage: the Assignments Overview view mode ('flat' | 'byPolicy'), remembered per browser.
export const ASSIGNMENTS_OVERVIEW_VIEW_MODE_KEY = 'assignmentsOverviewViewMode';
