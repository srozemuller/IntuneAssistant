using IntuneAssistant.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IAssignmentsService
{
    Task<List<CustomAssignmentsModel>?> GetConfigurationPolicyAssignmentsListAsync(string? accessToken,
        GroupModel? group, List<ConfigurationPolicyModel> configurationPolicies);
    Task<List<CustomAssignmentsModel>?> GetDeviceManagementScriptsAssignmentsListAsync(string? accessToken, GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetDeviceConfigurationsAssignmentsListAsync(string? accessToken, GroupModel? group, List<DeviceConfigurationModel> configurations);
    Task<List<CustomAssignmentsModel>?> GetHealthScriptsAssignmentsByGroupListAsync(string? accessToken, GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetAutoPilotAssignmentsByGroupListAsync(string? accessToken, GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetMobileAppAssignmentsByGroupListAsync(string? accessToken, GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetManagedApplicationAssignmentListAsync(string? accessToken, GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetTargetedAppConfigurationsAssignmentsByGroupListAsync(string? accessToken, GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetAppProtectionAssignmentsByGroupListAsync(string? accessToken, GroupModel? group);
    Task<List<CustomAssignmentsModel>> GetCompliancePoliciesAssignmentsListAsync(string? accessToken, GroupModel? group,
        List<CompliancePolicyModel> compliancePolicies);
    Task<List<CustomAssignmentsModel>?> GetUpdateRingsAssignmentsByGroupListAsync(string? accessToken,
        GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetFeatureUpdatesAssignmentsByGroupListAsync(string? accessToken,
        GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetWindowsDriverUpdatesAssignmentsByGroupListAsync(string? accessToken,
        GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetMacOsShellScriptsAssignmentListAsync(string? accessToken,
        GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetDiskEncryptionAssignmentListAsync(string? accessToken,
        GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetUpdatesForMacAssignmentListAsync(string? accessToken,
        GroupModel? group);
    Task<List<CustomAssignmentsModel>?> GetPlatformScriptsAssignmentListAsync(string? accessToken,
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