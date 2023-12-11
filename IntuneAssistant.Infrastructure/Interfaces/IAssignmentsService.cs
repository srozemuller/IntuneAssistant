using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IAssignmentsService
{
    Task<List<AssignmentsModel>?> GetConfigurationPolicyAssignmentsListAsync(string accessToken, GroupModel? group);
    Task<List<AssignmentsModel>?> GetDeviceManagementScriptsAssignmentsListAsync(string accessToken, GroupModel? group);
    Task<List<AssignmentsModel>?> GetHealthScriptsAssignmentsByGroupListAsync(string accessToken, GroupModel? group);
    Task<List<AssignmentsModel>?> GetAutoPilotAssignmentsByGroupListAsync(string accessToken, GroupModel? group);
    Task<List<AssignmentsModel>?> GetMobileAppAssignmentsByGroupListAsync(string accessToken, GroupModel? group);
    Task<List<AssignmentsModel>?> GetTargetedAppConfigurationsAssignmentsByGroupListAsync(string accessToken, GroupModel? group);
    Task<List<AssignmentsModel>?> GetAppProtectionAssignmentsByGroupListAsync(string accessToken, GroupModel? group);
    Task<List<AssignmentsModel>?> GetCompliancePoliciesAssignmentsListAsync(string accessToken, GroupModel? group);
    Task<List<AssignmentsModel>?> GetUpdateRingsAssignmentsByGroupListAsync(string accessToken,
        GroupModel? group);
    Task<List<AssignmentsModel>?> GetFeatureUpdatesAssignmentsByGroupListAsync(string accessToken,
        GroupModel? group);
    Task<List<AssignmentsModel>?> GetWindowsDriverUpdatesAssignmentsByGroupListAsync(string accessToken,
        GroupModel? group);
}