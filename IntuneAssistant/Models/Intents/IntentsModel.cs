namespace IntuneAssistant.Models.Intents;

public class IntentsModel
{
    public string Id { get; set; }
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public bool IsAssigned { get; set; }
    public bool? IsMigratingToConfigurationPolicy { get; set; }
    public DateTime LastModifiedDateTime { get; set; }
    public string TemplateId { get; set; }
    public List<string> RoleScopeTagIds { get; set; }
}