// Shared types and constants for the Backup (export) page.
// This app is read-only: it only ever reads and exports configuration — there is no
// import-back-into-the-tenant counterpart here.

export const BATCH_SIZE = 20;

export interface ResourceType {
    key: string;
    label: string;
    folder: string;
}

export const RESOURCE_TYPES: ResourceType[] = [
    { key: 'SettingsCatalog', label: 'Settings Catalog', folder: 'SettingsCatalog' },
    { key: 'DeviceConfiguration', label: 'Device Configuration', folder: 'DeviceConfiguration' },
    { key: 'CompliancePolicies', label: 'Compliance Policies', folder: 'CompliancePolicies' },
    { key: 'ConditionalAccess', label: 'Conditional Access', folder: 'ConditionalAccess' },
    { key: 'AssignmentFilters', label: 'Assignment Filters', folder: 'AssignmentFilters' },
    { key: 'ScopeTags', label: 'Scope Tags', folder: 'ScopeTags' },
    { key: 'AppProtectionIos', label: 'App Protection (iOS)', folder: 'AppProtection' },
    { key: 'AppProtectionAndroid', label: 'App Protection (Android)', folder: 'AppProtection' },
    { key: 'AppProtectionWindows', label: 'App Protection (Windows)', folder: 'AppProtection' },
    { key: 'EnrollmentRestrictions', label: 'Enrollment Restrictions', folder: 'EnrollmentRestrictions' },
    { key: 'AutoPilot', label: 'Autopilot Profiles', folder: 'AutoPilot' },
    { key: 'DeviceHealthScripts', label: 'Device Health Scripts', folder: 'DeviceHealthScripts' },
    { key: 'PowerShellScripts', label: 'PowerShell Scripts', folder: 'PowerShellScripts' },
    { key: 'MacScripts', label: 'macOS Shell Scripts', folder: 'MacScripts' },
    { key: 'AdministrativeTemplates', label: 'Administrative Templates', folder: 'AdministrativeTemplates' },
    { key: 'FeatureUpdates', label: 'Feature Update Profiles', folder: 'FeatureUpdates' },
    { key: 'DriverUpdateProfiles', label: 'Driver Update Profiles', folder: 'DriverUpdateProfiles' },
    { key: 'QualityUpdateProfiles', label: 'Quality Update Profiles', folder: 'QualityUpdateProfiles' },
    { key: 'EndpointSecurity', label: 'Endpoint Security', folder: 'EndpointSecurity' },
    { key: 'AppConfigurationManagedApp', label: 'App Config (Managed App)', folder: 'AppConfigurationManagedApp' },
    { key: 'AppConfigurationManagedDevice', label: 'App Config (Managed Device)', folder: 'AppConfigurationManagedDevice' },
    { key: 'EnrollmentStatusPage', label: 'Enrollment Status Page', folder: 'EnrollmentStatusPage' },
    { key: 'Notifications', label: 'Notification Templates', folder: 'Notifications' },
    { key: 'IntuneBranding', label: 'Intune Branding', folder: 'IntuneBranding' },
    { key: 'TermsOfUse', label: 'Terms of Use', folder: 'TermsOfUse' },
    { key: 'NamedLocations', label: 'Named Locations', folder: 'NamedLocations' },
    { key: 'AuthenticationStrengths', label: 'Authentication Strengths', folder: 'AuthenticationStrengths' },
    { key: 'ComplianceScripts', label: 'Compliance Scripts', folder: 'ComplianceScripts' },
    { key: 'ADMXFiles', label: 'ADMX Files', folder: 'ADMXFiles' },
];

// Resource types that don't support roleScopeTagIds in Graph — they will be skipped when a scope tag filter is active.
export const SCOPE_TAG_UNSUPPORTED = new Set([
    'ConditionalAccess', 'NamedLocations', 'AuthenticationStrengths', 'TermsOfUse', 'IntuneBranding',
]);

// Static OS platform for unambiguous resource types.
// Types not listed here are 'mixed' (platform detected per item from content).
export type OsPlatform = 'windows' | 'macos' | 'ios' | 'android' | 'cross-platform' | 'mixed';

export const RESOURCE_PLATFORM: Record<string, OsPlatform> = {
    MacScripts: 'macos',
    PowerShellScripts: 'windows',
    AdministrativeTemplates: 'windows',
    ADMXFiles: 'windows',
    FeatureUpdates: 'windows',
    DriverUpdateProfiles: 'windows',
    QualityUpdateProfiles: 'windows',
    AppProtectionIos: 'ios',
    AppProtectionAndroid: 'android',
    AppProtectionWindows: 'windows',
    AssignmentFilters: 'cross-platform',
    ScopeTags: 'cross-platform',
    ConditionalAccess: 'cross-platform',
    NamedLocations: 'cross-platform',
    AuthenticationStrengths: 'cross-platform',
    Notifications: 'cross-platform',
    IntuneBranding: 'cross-platform',
    TermsOfUse: 'cross-platform',
};
