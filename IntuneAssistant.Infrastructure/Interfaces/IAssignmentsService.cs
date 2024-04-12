using IntuneAssistant.Models;
using IntuneAssistant.Models.Apps;
using IntuneAssistant.Models.AutoPilot;
using IntuneAssistant.Models.Scripts;
using IntuneAssistant.Models.Group;

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
    Task<List<CustomAssignmentsModel>?> GetMobileAppAssignmentsByGroupListAsync(string? accessToken, GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetManagedApplicationAssignmentListAsync(string? accessToken, GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetTargetedAppConfigurationsAssignmentsByGroupListAsync(string? accessToken, GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetWindowsAppProtectionAssignmentsListAsync(string? accessToken, GroupModel? group, List<WindowsManagedAppProtectionsModel>? windowsManagedAppProtections);
    Task<List<CustomAssignmentsModel>> GetCompliancePoliciesAssignmentsListAsync(string? accessToken, GroupModel? group,
        List<CompliancePolicyModel> compliancePolicies);
    Task<List<CustomAssignmentsModel>?> GetUpdateRingsAssignmentsByGroupListAsync(string? accessToken,
        GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetFeatureUpdatesAssignmentsByGroupListAsync(string? accessToken,
        GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetWindowsDriverUpdatesAssignmentsByGroupListAsync(string? accessToken,
        GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetDiskEncryptionAssignmentListAsync(string? accessToken,
        GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetUpdatesForMacAssignmentListAsync(string? accessToken,
        GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetDevicePlatformRestrictionsAssignmentListAsync(string? accessToken,
        GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetDeviceLimitRestrictionsAssignmentListAsync(string? accessToken,
        GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetMacOsCustomAttributesAssignmentListAsync(string? accessToken,
        GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetIosLobAppProvisioningAssignmentListAsync(string? accessToken,
        GroupModel? group);
}