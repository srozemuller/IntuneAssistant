namespace IntuneAssistant.Models.Apps;

public class ManagedAppConfigurationModel
{
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public DateTime CreatedDateTime { get; set; }
    public DateTime LastModifiedDateTime { get; set; }
    public List<string> RoleScopeTagIds { get; set; }
    public string Id { get; set; }
    public string Version { get; set; }
    public int DeployedAppCount { get; set; }
    public bool IsAssigned { get; set; }
    public string TargetedAppManagementLevels { get; set; }
    public string AppGroupType { get; set; }
    public List<CustomSetting> CustomSettings { get; set; }
}

public class CustomSetting
{
    public string Name { get; set; }
    public string Value { get; set; }
}