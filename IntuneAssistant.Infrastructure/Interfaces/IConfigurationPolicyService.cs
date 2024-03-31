using IntuneAssistant.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IConfigurationPolicyService
{
    Task<List<ConfigurationPolicyModel>?> GetConfigurationPoliciesListAsync(string? accessToken);
    Task<List<CustomPolicySettingsModel>?> GetConfigurationPoliciesSettingsListAsync(string? accessToken, List<ConfigurationPolicyModel> policies);
    Task<int> CreateConfigurationPolicyAsync(string? accessToken, ConfigurationPolicyModel configurationPolicy);
}