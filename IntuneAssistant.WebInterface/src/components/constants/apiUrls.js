// API Endpoints
export const API_BASE_PRD_URL = 'https://api.intuneassistant.cloud/v1';
export const API_BASE_DEV_URL = 'https://localhost:7224/v1';

export const API_BASE_URL = process.env.NODE_ENV === 'development' ? API_BASE_DEV_URL : API_BASE_PRD_URL;


export const POLICIES_ENDPOINT = `${API_BASE_URL}/policies`;
export const CONFIGURATION_POLICIES_ENDPOINT = `${POLICIES_ENDPOINT}/configuration`;
export const CA_POLICIES_ENDPOINT = `${POLICIES_ENDPOINT}/ca`;
export const ASSIGNMENTS_ENDPOINT = `${API_BASE_URL}/assignments`;
export const POLICY_SETTINGS_ENDPOINT = `${CONFIGURATION_POLICIES_ENDPOINT}/settings`;