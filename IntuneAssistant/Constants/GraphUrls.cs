namespace IntuneAssistant.Constants;

public class GraphUrls
{
    public const string GroupsUrl = $"{AppConfiguration.GRAPH_URL}/groups";
    public const string GetByIdsUrl = $"{AppConfiguration.GRAPH_URL}/directoryObjects/getByIds?$select=displayName,id";
    
    public const string ManagedDevicesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/managedDevices?$select=id,deviceName,ComplianceState,LastSyncDateTime,OsVersion,SerialNumber,OperatingSystem";

    public const string UpdateRingsUrl =
        $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceConfigurations?$filter=isof(%27microsoft.graph.windowsUpdateForBusinessConfiguration%27)&$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string UpdatePoliciesForMacUrl =
        $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceConfigurations?$expand=assignments($select=id,target)&$select=id,displayname,description";

    public const string CompliancePoliciesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceCompliancePolicies";
    public const string ConfigurationPoliciesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/configurationPolicies";
    public const string DeviceConfigurationsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceConfigurations";
    public const string GroupPolicyConfigurationsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/groupPolicyConfigurations";
    public const string ConfigurationPoliciesAssignmentsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/configurationPolicies?$expand=assignments($select=id,target),settings&$top=1000";
    public const string DeviceHealthScriptsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceHealthScripts";
    public const string PlatformScriptsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceManagementScripts?$expand=assignments($select=id,target)&$select=id,displayname,description";

    public const string DeviceManagementScriptsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceManagementScripts";
    public const string WindowsAutopilotDeploymentProfilesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/windowsAutopilotDeploymentProfiles?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string DevicePlatformRestrictionsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceEnrollmentConfigurations?$expand=assignments($select=id,target)&$select=id,displayname,description&$filter=deviceEnrollmentConfigurationType%20eq%20%27SinglePlatformRestriction%27";
    public const string DeviceLimitRestrictionsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceEnrollmentConfigurations?$expand=assignments($select=id,target)&$select=id,displayname,description&$filter=deviceEnrollmentConfigurationType%20eq%20%27Limit%27";

    public const string IosLobAppProvisioningUrl = $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/iosLobAppProvisioningConfigurations?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string MobileAppsUrl = $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/mobileApps";
    public const string ManagedAppPoliciesUrl = $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/managedAppPolicies?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string TargetedManagedAppConfigurationsUrl = $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/targetedManagedAppConfigurations?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string WindowsManagedAppProtectionsUrl = $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/windowsManagedAppProtections?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string IosManagedAppProtectionsUrl = $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/iosManagedAppProtections?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string AndroidManagedAppProtectionsUrl = $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/androidManagedAppProtections?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string WindowsFeatureUpdatesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/windowsFeatureUpdateProfiles?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string WindowsDriverUpdatesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/windowsDriverUpdateProfiles?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string MacOsShellScripts = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceShellScripts?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string MacOsCustomAttributesScripts = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceCustomAttributeShellScripts?$expand=assignments($select=id,target)&$select=id,displayname,description";

    public const string DiskEncryptionPoliciesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/intents?$filter=templateId%20eq%20%27d1174162-1dd2-4976-affc-6667049ab0ae%27%20or%20templateId%20eq%20%27a239407c-698d-4ef8-b314-e3ae409204b8%27&$expand=assignments($select=id,target)";

    public const string AssignmentFiltersUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/assignmentFilters?$select=id,CreatedDateTime,LastModifiedDateTime,DisplayName,Description,Platform,Rule,AssignmentFilterManagementType";

    public const string RoleDefinitionsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/roleDefinitions?$select=id,displayname,description,isBuiltIn";
}
