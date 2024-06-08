namespace IntuneAssistant.Constants;

public class GraphUrls
{
    public const string GroupsUrl = $"{AppConfiguration.GRAPH_URL}/groups";
    public const string UsersUrl = $"{AppConfiguration.GRAPH_URL}/users";
    public const string GetByIdsUrl = $"{AppConfiguration.GRAPH_URL}/directoryObjects/getByIds?$select=displayName,id";
    
    // Devices
    public const string ManagedDevicesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/managedDevices";
    
    
    // Policies
    public const string CaPoliciesUrl = $"{AppConfiguration.GRAPH_URL}/identity/conditionalAccess/policies";
    public const string CompliancePoliciesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceCompliancePolicies";
    public const string ConfigurationPoliciesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/configurationPolicies";
    public const string DeviceConfigurationsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceConfigurations";
    public const string GroupPolicyConfigurationsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/groupPolicyConfigurations";
    public const string ConfigurationPoliciesAssignmentsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/configurationPolicies?$expand=assignments($select=id,target),settings&$top=1000";
    
    // Scripts
    public const string DeviceHealthScriptsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceHealthScripts";
    public const string DeviceManagementScriptsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceManagementScripts";
    public const string DeviceShellScriptUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/DeviceShellScripts";

    // Autopilot
    public const string WindowsAutopilotDeploymentProfilesUrl =
        $"{AppConfiguration.GRAPH_URL}/deviceManagement/windowsAutopilotDeploymentProfiles";
    
    // Enrollment configurations
    public const string DevicePlatformRestrictionsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceEnrollmentConfigurations?$filter=deviceEnrollmentConfigurationType%20eq%20%27SinglePlatformRestriction%27";
    public const string DeviceLimitRestrictionsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceEnrollmentConfigurations?$expand=assignments($select=id,target)&$select=id,displayname,description&$filter=deviceEnrollmentConfigurationType%20eq%20%27Limit%27";
    public const string DeviceEnrollmentConfigurationsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceEnrollmentConfigurations";
    
    public const string IosLobAppProvisioningUrl = $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/iosLobAppProvisioningConfigurations";
    public const string MobileAppsUrl = $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/mobileApps?$filter=(microsoft.graph.managedApp/appAvailability%20eq%20null%20or%20microsoft.graph.managedApp/appAvailability%20eq%20%27lineOfBusiness%27%20or%20isAssigned%20eq%20true)";
    public const string ManagedAppPoliciesUrl = $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/managedAppPolicies";
    public const string TargetedManagedAppConfigurationsUrl = $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/targetedManagedAppConfigurations";

    public const string WindowsManagedAppProtectionsUrl =
        $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/windowsManagedAppProtections";
    public const string IosManagedAppProtectionsUrl = $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/iosManagedAppProtections";
    public const string AndroidManagedAppProtectionsUrl = $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/androidManagedAppProtections";
    public const string WindowsFeatureUpdatesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/windowsFeatureUpdateProfiles";
    public const string WindowsDriverUpdatesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/windowsDriverUpdateProfiles";
    public const string WindowsQualityUpdatesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/windowsQualityUpdateProfiles";
    public const string MacOsCustomAttributesScripts = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceCustomAttributeShellScripts";

    public const string IntentsProfilesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/intents";
    public const string DiskEncryptionPoliciesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/intents?$filter=templateId%20eq%20%27d1174162-1dd2-4976-affc-6667049ab0ae%27%20or%20templateId%20eq%20%27a239407c-698d-4ef8-b314-e3ae409204b8%27";
    public const string SecurityBaselineIntentsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/intents?$filter=templateId%20eq%20%27034ccd46-190c-4afc-adf1-ad7cc11262eb%27%20or%20templateId%20eq%20%27cef15778-c3b9-4d53-a00a-042929f0aad0%27";
    public const string WindowsHelloIntentsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/intents?$filter=templateId%20eq%20%270f2b5d70-d4e9-4156-8c16-1397eb6c54a5%27";

    public const string AssignmentFiltersUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/assignmentFilters?$select=id,CreatedDateTime,LastModifiedDateTime,DisplayName,Description,Platform,Rule,AssignmentFilterManagementType";

    public const string RoleDefinitionsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/roleDefinitions?$select=id,displayname,description,isBuiltIn";
}
