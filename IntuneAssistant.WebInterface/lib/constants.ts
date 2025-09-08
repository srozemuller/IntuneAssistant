export const API_BASE_PRD_URL = 'https://api.intuneassistant.cloud/v1';
export const API_BASE_DEV_URL = 'https://localhost:7224/v1';

export const API_BASE_URL = process.env.NODE_ENV === 'development' ? API_BASE_DEV_URL : API_BASE_PRD_URL;

export const ASSIGNMENTS_ENDPOINT = `${API_BASE_URL}/assignments`;
export const CONSENT_CALLBACK = `${API_BASE_URL}/consent-callback`;
export const INTUNEASSISTANT_TENANT_INFO = `${API_BASE_URL}/tenant/license-info`;
export const INTUNEASSISTANT_TENANT_STYLE = `${API_BASE_URL}/tenant/style`;

export const GROUPS_ENDPOINT = `${API_BASE_URL}/groups`;
export const GROUPS_LIST_ENDPOINT = `${API_BASE_URL}/groups/list`;

export const COMPARE_ENDPOINT = `${API_BASE_URL}/compare`;
export const CUSTOMER_ENDPOINT = `${API_BASE_URL}/customer`;

export const POLICIES_ENDPOINT = `${API_BASE_URL}/policies`;
export const EXPORT_ENDPOINT = `${API_BASE_URL}/export`;
export const CONFIGURATION_POLICIES_ENDPOINT = `${POLICIES_ENDPOINT}/configuration`;
export const CA_POLICIES_ENDPOINT = `${POLICIES_ENDPOINT}/ca`;
export const ASSIGNMENTS_GROUP_ENDPOINT = `${API_BASE_URL}/assignments/groups`;
export const ASSIGNMENTS_FILTERS_ENDPOINT = `${API_BASE_URL}/assignments/filters`;
export const ASSIGNMENTS_COMPARE_ENDPOINT = `${API_BASE_URL}/assignments/compare`;
export const POLICY_SETTINGS_ENDPOINT = `${CONFIGURATION_POLICIES_ENDPOINT}/settings`;


export const GROUP_POLICY_SETTINGS_ENDPOINT = `${POLICIES_ENDPOINT}/group/settings`;


export const ITEMS_PER_PAGE = 25;