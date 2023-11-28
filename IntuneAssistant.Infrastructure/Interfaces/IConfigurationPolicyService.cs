using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IConfigurationPolicyService
{
    Task<List<ConfigurationPolicy>?> GetConfigurationPoliciesListAsync(string accessToken, bool assignmentFilter);
    Task<ConfigurationPolicy?> GetConfigurationPolicyByIdAsync(string accessToken, string policyId);
    Task<ConfigurationPolicy?> GetConfigurationPolicySettingsByIdAsync(string accessToken, string policyId);
}