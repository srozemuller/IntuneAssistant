using IntuneAssistant.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IConfigurationPolicyService
{
    Task<List<ConfigurationPolicyModel>?> GetConfigurationPoliciesListAsync(string accessToken);
    Task<List<CustomPolicySettingsModel>?> GetConfigurationPoliciesSettingsListAsync(string accessToken, string policyId);
    Task<int> CreateConfigurationPolicyAsync(string accessToken, ConfigurationPolicyModel configurationPolicy);
}