namespace IntuneAssistant.Models;

public class DeviceHealthScriptModel
{
    public string ODataContext { get; set; }
    public string Id { get; set; }
    public string Publisher { get; set; }
    public string Version { get; set; }
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public string DetectionScriptContent { get; set; }
    public string RemediationScriptContent { get; set; }
    public DateTime CreatedDateTime { get; set; }
    public DateTime LastModifiedDateTime { get; set; }
    public string RunAsAccount { get; set; }
    public bool EnforceSignatureCheck { get; set; }
    public bool RunAs32Bit { get; set; }
    public List<string> RoleScopeTagIds { get; set; }
    public bool IsGlobalScript { get; set; }
    public object HighestAvailableVersion { get; set; }
    public string DeviceHealthScriptType { get; set; }
    public List<string> DetectionScriptParameters { get; set; }
    public List<string> RemediationScriptParameters { get; set; }
    public string AssignmentsODataContext { get; set; }
    public List<Assignment>? Assignments { get; set; }
}
