using IntuneAssistant.Models;
using IntuneAssistant.Models.Devices;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IConfigurationPolicyService
{
    Task<List<ConfigurationPolicyModel>?> GetConfigurationPoliciesListAsync(string? accessToken);
    Task<List<DeviceConfigurationModel>?> GetDeviceConfigurationsListAsync(string? accessToken);
    Task<List<GroupPolicyConfigurationModel>?> GetGroupPolicyConfigurationsListAsync(string? accessToken);
    Task<List<CustomPolicySettingsModel>?> GetConfigurationPoliciesSettingsListAsync(string? accessToken, List<ConfigurationPolicyModel> policies);
    Task<int> CreateConfigurationPolicyAsync(string? accessToken, ConfigurationPolicyModel configurationPolicy);
}