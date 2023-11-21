using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IAssignmentsService
{
    Task<List<AssignmentsModel>?> GetCompliancePolicyAssignmentsByGroupListAsync(string accessToken, Group group);
    Task<List<AssignmentsModel>?> GetConfigurationPolicyAssignmentsByGroupListAsync(string accessToken, Group group);
    Task<List<AssignmentsModel>?> GetDeviceManagementScriptsAssignmentsByGroupListAsync(string accessToken, Group group);
    Task<List<AssignmentsModel>?> GetHealthScriptsAssignmentsByGroupListAsync(string accessToken, Group group);
    Task<List<AssignmentsModel>?> GetAutoPilotAssignmentsByGroupListAsync(string accessToken, Group group);
    Task<List<AssignmentsModel>?> GetMobileAppAssignmentsByGroupListAsync(string accessToken, Group group);
    Task<List<AssignmentsModel>?> GetTargetedAppConfigurationsAssignmentsByGroupListAsync(string accessToken, Group group);
    Task<List<AssignmentsModel>?> GetAppProtectionAssignmentsByGroupListAsync(string accessToken, Group group);
    Task<List<AssignmentsModel>?> GetAssignmentsListAsync(string accessToken);
}