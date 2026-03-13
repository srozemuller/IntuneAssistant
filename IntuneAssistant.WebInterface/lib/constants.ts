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

export const AUDITLOG_ENDPOINT = `${API_BASE_URL}/auditlog`;

export const AUDIT_EVENT_ENDPOINT = `${API_BASE_URL}/audit`;
export const AUDIT_EVENT_PAGE_ENDPOINT = `${AUDIT_EVENT_ENDPOINT}/events/page`;
export const AUDIT_EVENT_METADATA_ENDPOINT = `${AUDIT_EVENT_ENDPOINT}/metadata`;
export const AUDIT_EVENT_FILTER_ENDPOINT = `${AUDIT_EVENT_ENDPOINT}/events/filter`;
export const AUDIT_EVENT_STATS_ENDPOINT = `${AUDIT_EVENT_ENDPOINT}/statistics`;


export const PARTNER_TENANTS_ENDPOINT = `${API_BASE_URL}/partner/customers`;
export const ASSIGNMENTS_ENDPOINT = `${API_BASE_URL}/assignments`;
export const CONSENT_URL_ENDPOINT = `${API_BASE_URL}/consent/build-url`;
export const CONSENT_CALLBACK = `${API_BASE_URL}/consent/callback`;
export const CONSENT_UTCM_VERIFY = `${API_BASE_URL}/consent/utcm-verify`;
export const IA_VERIFY_ENDPOINT = `${API_BASE_URL}/consent/intuneassistant-verify`;

export const INTUNEASSISTANT_TENANT_INFO = `${API_BASE_URL}/tenant/license-info`;
export const INTUNEASSISTANT_TENANT_STYLE = `${API_BASE_URL}/tenant/style`;
export const USERS_ENDPOINT = `${API_BASE_URL}/user`;
export const GROUPS_ENDPOINT = `${API_BASE_URL}/groups`;
export const DEVICES_ENDPOINT = `${API_BASE_URL}/devices`;

// lib/constants.ts
export const DEVICES_STATS_ENDPOINT = `${DEVICES_ENDPOINT}/stats`;

export const GROUPS_LIST_ENDPOINT = `${API_BASE_URL}/groups/list`;

export const COMPARE_ENDPOINT = `${API_BASE_URL}/compare`;
export const CUSTOMER_ENDPOINT = `${API_BASE_URL}/customer`;

export const POLICIES_ENDPOINT = `${API_BASE_URL}/policies`;
export const EXPORT_ENDPOINT = `${API_BASE_URL}/export`;
export const CONFIGURATION_POLICIES_ENDPOINT = `${POLICIES_ENDPOINT}/configuration`;
export const CONFIGURATION_POLICIES_BULK_DELETE_ENDPOINT = `${POLICIES_ENDPOINT}/configuration/bulk`;
export const CA_POLICIES_ENDPOINT = `${POLICIES_ENDPOINT}/ca`;
export const ASSIGNMENTS_GROUP_ENDPOINT = `${API_BASE_URL}/assignments/groups`;
export const ASSIGNMENTS_FILTERS_ENDPOINT = `${API_BASE_URL}/assignments/filters`;

export const ASSIGNMENTS_WITH_FILTER_ENDPOINT = `${API_BASE_URL}/assignments/with-filter`;
export const ASSIGNMENTS_COMPARE_ENDPOINT = `${API_BASE_URL}/assignments/compare`;
export const POLICY_SETTINGS_ENDPOINT = `${CONFIGURATION_POLICIES_ENDPOINT}/settings`;

export const ROLE_SCOPETAGS_ENDPOINT = `${API_BASE_URL}/roles/scopeTags`;
export const GROUP_POLICY_SETTINGS_ENDPOINT = `${POLICIES_ENDPOINT}/group/settings`;

export const MONITOR_CONFIGURATION_ENDPOINT = `${API_BASE_URL}/monitor/configuration`;
export const MONITOR_CONFIGURATION_DRIFTS_ENDPOINT = `${API_BASE_URL}/monitor/configuration/drifts`;
export const MONITOR_CONFIGURATION_RESULTS_ENDPOINT = `${API_BASE_URL}/monitor/configuration/results`;
export const MONITOR_CONFIGURATION_SNAPSHOTS_JOBS = `${API_BASE_URL}/monitor/snapshots/jobs`;

export const AUDIT_LOGS_BASE_URL = `${API_BASE_URL}/audit`;
export const AUDIT_LOGS_INTUNE_BASE_URL = `${API_BASE_URL}/audit/intune`;
export const AUDIT_LOGS_INTUNE_EVENTS = `${API_BASE_URL}/audit/intune/page`;
export const AUDIT_LOGS_INTUNE_FILTER = `${API_BASE_URL}/audit/intune/filter`;


export const MONITOR_CONFIGURATION_SNAPSHOTS = `${API_BASE_URL}/monitor/snapshots`;
export const ITEMS_PER_PAGE = 25;