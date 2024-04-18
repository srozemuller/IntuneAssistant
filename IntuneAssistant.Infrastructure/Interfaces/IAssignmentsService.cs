using IntuneAssistant.Helpers;
using IntuneAssistant.Models;
using IntuneAssistant.Models.Apps;
using IntuneAssistant.Models.Assignments;
using IntuneAssistant.Models.AutoPilot;
using IntuneAssistant.Models.Devices;
using IntuneAssistant.Models.Scripts;
using IntuneAssistant.Models.Group;
using IntuneAssistant.Models.Intents;
using IntuneAssistant.Models.Updates;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IAssignmentsService
{
    Task<List<CustomAssignmentsModel>?> GetConfigurationPolicyAssignmentsListAsync(string? accessToken,
        GroupModel? group, List<ConfigurationPolicyModel>? configurationPolicies);
    Task<List<CustomAssignmentsModel>?> GetDeviceManagementScriptsAssignmentsListAsync(string? accessToken, GroupModel? group, List<DeviceManagementScriptsModel>? deviceScripts);
    Task<List<CustomAssignmentsModel>?> GetDeviceShellScriptsAssignmentsListAsync(string? accessToken, GroupModel? group, List<DeviceShellScriptModel>? deviceShellScripts);
    Task<List<CustomAssignmentsModel>?> GetDeviceConfigurationsAssignmentsListAsync(string? accessToken, GroupModel? group, List<DeviceConfigurationModel>? configurations);
    Task<List<CustomAssignmentsModel>?> GetGroupPolicyConfigurationsAssignmentsListAsync(string? accessToken, GroupModel? group, List<GroupPolicyConfigurationModel>? groupPolicies);
    Task<List<CustomAssignmentsModel>?> GetHealthScriptsAssignmentsListAsync(string? accessToken, GroupModel? group, List<DeviceHealthScriptsModel>? healthScripts);
    Task<List<CustomAssignmentsModel>?> GetAutoPilotAssignmentsListAsync(string? accessToken, GroupModel? group, List<WindowsAutopilotDeploymentProfileModel>? profiles);
    Task<List<CustomAssignmentsModel>?> GetMobileAppAssignmentsListAsync(string? accessToken, GroupModel? group, List<DefaultMobileAppModel> mobileApps);
    Task<List<CustomAssignmentsModel>?> GetManagedApplicationAssignmentListAsync(string? accessToken, GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetTargetedAppConfigurationsAssignmentsListAsync(string? accessToken, GroupModel? group, List<ManagedAppConfigurationModel> appConfigurations);
    Task<List<CustomAssignmentsModel>?> GetWindowsAppProtectionAssignmentsListAsync(string? accessToken, GroupModel? group, List<WindowsManagedAppProtectionsModel>? windowsManagedAppProtections);
    
    Task<List<CustomAssignmentsModel>?> GetIosAppProtectionAssignmentsListAsync(string? accessToken, GroupModel? group, List<IosAppProtectionModel>? iosAppProtections);
    Task<List<CustomAssignmentsModel>?> GetAndroidAppProtectionAssignmentsListAsync(string? accessToken, GroupModel? group, List<AndroidAppProtectionModel>? androidAppProtections);
    
    Task<List<CustomAssignmentsModel>> GetCompliancePoliciesAssignmentsListAsync(string? accessToken, GroupModel? group,
        List<CompliancePolicyModel> compliancePolicies);
    Task<List<CustomAssignmentsModel>?> GetWindowsFeatureUpdatesAssignmentsListAsync(string? accessToken,
        GroupModel? group, List<WindowsFeatureUpdatesModel> windowsFeatureUpdatesProfiles);
    Task<List<CustomAssignmentsModel>?> GetWindowsDriverUpdatesAssignmentsListAsync(string? accessToken,
        GroupModel? group, List<WindowsDriverUpdatesModel> windowsDriverUpdatesProfiles);
    Task<List<CustomAssignmentsModel>?> GetIntentsAssignmentListAsync(string? accessToken,
        GroupModel? group, List<IntentsModel> intents);
    Task<List<CustomAssignmentsModel>?> GetDeviceEnrollmentAssignmentListAsync(string? accessToken,
        GroupModel? group, List<ResourceAssignmentsModel> resources);
    Task<List<CustomAssignmentsModel>?> GetMacOsCustomAttributesAssignmentListAsync(string? accessToken,
        GroupModel? group, List<ResourceAssignmentsModel> resources);
    Task<List<CustomAssignmentsModel>?> GetIosLobAppProvisioningAssignmentListAsync(string? accessToken,
        GroupModel? group, List<ResourceAssignmentsModel> resources);
}