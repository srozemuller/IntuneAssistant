namespace IntuneAssistant.Models;

public sealed record ConfigurationPolicy
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Platforms { get; init; } = string.Empty;
    public string Technologies { get; init; } = string.Empty;
    public object Settings { get; set; }
    public string TemplateReference { get; set; } = String.Empty;
    
}