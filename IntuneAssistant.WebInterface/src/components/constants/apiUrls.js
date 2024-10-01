// API Endpoints
export const API_BASE_PRD_URL = 'https://api.intuneassistant.cloud/v1';
export const API_BASE_DEV_URL = 'https://localhost:7224/v1';

export const API_BASE_URL = process.env.NODE_ENV === 'development' ? API_BASE_DEV_URL : API_BASE_PRD_URL;

export const CONSENT_CALLBACK = `${API_BASE_URL}/consent-callback`;

export const GROUPS_ENDPOINT = `${API_BASE_URL}/groups`;

export const POLICIES_ENDPOINT = `${API_BASE_URL}/policies`;
export const CONFIGURATION_POLICIES_ENDPOINT = `${POLICIES_ENDPOINT}/configuration`;
export const CA_POLICIES_ENDPOINT = `${POLICIES_ENDPOINT}/ca`;
export const ASSIGNMENTS_ENDPOINT = `${API_BASE_URL}/assignments`;
export const ASSIGNMENTS_FILTERS_ENDPOINT = `${API_BASE_URL}/assignments/filters`;
export const POLICY_SETTINGS_ENDPOINT = `${CONFIGURATION_POLICIES_ENDPOINT}/settings`;

export const GROUP_POLICY_SETTINGS_ENDPOINT = `${POLICIES_ENDPOINT}/group/settings`;

export const ASSIGNMENTS_MIGRATION_ENDPOINT = `${ASSIGNMENTS_ENDPOINT}/compare`;
export const ASSIGNMENTS_CONFIGURATION_POLICY_ENDPOINT = `${ASSIGNMENTS_ENDPOINT}/configuration`;
export const ASSIGNMENTS_MIGRATE_ENDPOINT = `${ASSIGNMENTS_ENDPOINT}/migrate`;

