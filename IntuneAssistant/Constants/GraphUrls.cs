namespace IntuneAssistant.Constants;

public class GraphUrls
{
    public const string GroupsUrl = $"{AppConfiguration.GRAPH_URL}/groups?$select=id,displayname,Description,CreatedDateTime";
    public const string ManagedDevicesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/managedDevices?$select=id,deviceName,ComplianceState,LastSyncDateTime,OsVersion,SerialNumber,OperatingSystem";

    public const string UpdateRingsUrl =
        $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceConfigurations?$filter=isof(%27microsoft.graph.windowsUpdateForBusinessConfiguration%27)&$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string CompliancePoliciesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceCompliancePolicies?$expand=assignments($select=id,target)&$select=id,displayname,description";
    
    public const string ConfigurationPoliciesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/configurationPolicies?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string DeviceHealthScriptsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceHealthScripts?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string DeviceManagementScriptsUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/deviceManagementScripts?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string WindowsAutopilotDeploymentProfilesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/windowsAutopilotDeploymentProfiles?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string MobileAppsUrl = $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/mobileApps?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string ManagedAppPoliciesUrl = $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/managedAppPolicies?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string TargetedManagedAppConfigurationsUrl = $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/targetedManagedAppConfigurations?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string WindowsManagedAppProtectionsUrl = $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/windowsManagedAppProtections?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string IosManagedAppProtectionsUrl = $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/iosManagedAppProtections?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string AndroidManagedAppProtectionsUrl = $"{AppConfiguration.GRAPH_URL}/deviceAppManagement/androidManagedAppProtections?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string WindowsFeatureUpdatesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/windowsFeatureUpdateProfiles?$expand=assignments($select=id,target)&$select=id,displayname,description";
    public const string WindowsDriverUpdatesUrl = $"{AppConfiguration.GRAPH_URL}/deviceManagement/windowsDriverUpdateProfiles?$expand=assignments($select=id,target)&$select=id,displayname,description";

    
        
    
}
