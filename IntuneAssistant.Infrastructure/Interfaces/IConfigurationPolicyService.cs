using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IConfigurationPolicyService
{
    Task<List<DeviceManagementConfigurationPolicy>?> GetConfigurationPoliciesListAsync(string accessToken);
}