using IntuneAssistant.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IConfigurationPolicyService
{
    Task<List<ConfigurationPolicyModel>?> GetConfigurationPoliciesListAsync(string? accessToken);
    Task<List<CustomPolicySettingsModel>?> GetConfigurationPoliciesSettingsListAsync(string? accessToken, ConfigurationPolicyModel policy);
    Task<int> CreateConfigurationPolicyAsync(string? accessToken, ConfigurationPolicyModel configurationPolicy);
}