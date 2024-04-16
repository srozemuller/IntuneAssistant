namespace IntuneAssistant.Models.Updates;

public class WindowsDriverUpdatesModel
{
    public string Id { get; set; }
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public string ApprovalType { get; set; }
    public int DeviceReporting { get; set; }
    public int NewUpdates { get; set; }
    public int? DeploymentDeferralInDays { get; set; }
    public DateTime CreatedDateTime { get; set; }
    public DateTime LastModifiedDateTime { get; set; }
    public List<string> RoleScopeTagIds { get; set; }
    public string InventorySyncStatus { get; set; }
    public string AssignmentsOdataContext { get; set; }
    public List<Assignment> Assignments { get; set; }
}