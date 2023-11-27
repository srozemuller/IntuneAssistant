using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Models;

public sealed record ConfigurationPolicyModel
{
    public string Name { get; set; } = String.Empty;
    public string Description { get; set; } = String.Empty;
    public string Platforms { get; set; } = String.Empty;
    public string Technologies { get; set; } = String.Empty;
    public object? Settings { get; set; }
    public object? TemplateReference { get; set; }
    
    public object Assignments { get; set; }
}


public static class ConfigurationModelExtensions
{
    public static ConfigurationPolicyModel ToConfigurationPolicyModel(this DeviceManagementConfigurationPolicy configurationPolicy)
    {
        return new ConfigurationPolicyModel
        {
            Name = configurationPolicy.Name,
            Description = configurationPolicy.Description,
            Platforms = configurationPolicy.Platforms.ToString(),
            Technologies = configurationPolicy.Technologies.ToString(),
            Settings = configurationPolicy.Settings,
            TemplateReference = configurationPolicy.TemplateReference,
            Assignments = configurationPolicy.Assignments
        };
    }
}