using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Models;


public sealed record ConfigurationPolicy
{
    public string OdataType { get; set; }
    public string CreatedDateTime { get; set; }
    public string Description { get; set; }
    public string LastModifiedDateTime { get; set; }
    public string Name { get; set; }
    public string Platforms { get; set; }
    public string[] RoleScopeTagIds { get; set; }
    public string SettingCount { get; set; }
    public string Technologies { get; set; }
    public string Id { get; set; }
    public DeviceManagementConfigurationPolicyTemplateReference TemplateReference { get; set; }
    public object Settings;
    public List<DeviceManagementConfigurationPolicyAssignment> Assignments { get; set; }
}

public class TemplateReference
{
    public string TemplateId { get; set; }
    public string TemplateFamily { get; set; }
    public string TemplateDisplayName { get; set; }
    public string TemplateDisplayVersion { get; set; }
}

public static class ConfigurationModelExtensions
{
    public static ConfigurationPolicy ToConfigurationPolicyModel(this DeviceManagementConfigurationPolicy configurationPolicy)
    {
        return new ConfigurationPolicy
        {
            OdataType = configurationPolicy.OdataType,
            Name = configurationPolicy.Name,
            Description = configurationPolicy.Description,
            Platforms = configurationPolicy.Platforms.ToString(),
            Technologies = configurationPolicy.Technologies.ToString(),
            SettingCount = configurationPolicy.SettingCount.ToString(),
            TemplateReference = configurationPolicy.TemplateReference,
        };
    }
}