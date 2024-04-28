namespace IntuneAssistant.Models.Updates;

public class ExpeditedUpdateSettings
{
    public DateTime QualityUpdateRelease { get; set; }
    public int DaysUntilForcedReboot { get; set; }
}

public class WindowsQualityUpdateModel
{
    public string Id { get; set; }
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public DateTime CreatedDateTime { get; set; }
    public DateTime LastModifiedDateTime { get; set; }
    public List<string> RoleScopeTagIds { get; set; }
    public string ReleaseDateDisplayName { get; set; }
    public string DeployableContentDisplayName { get; set; }
    public ExpeditedUpdateSettings ExpeditedUpdateSettings { get; set; }
    public string AssignmentsOdataContext { get; set; }
    public List<object> Assignments { get; set; }
}