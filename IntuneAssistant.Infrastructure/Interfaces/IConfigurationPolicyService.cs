using IntuneAssistant.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IConfigurationPolicyService
{
    Task<List<ConfigurationPolicyModel>?> GetConfigurationPoliciesListAsync(string accessToken);
    Task<int> CreateConfigurationPolicyAsync(string accessToken, ConfigurationPolicyModel configurationPolicy);
}