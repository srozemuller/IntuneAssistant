namespace IntuneAssistant.Models.Scripts;

public class DeviceManagementScriptsModel
{
    public string ODataContext { get; set; }
    public bool EnforceSignatureCheck { get; set; }
    public bool RunAs32Bit { get; set; }
    public string Id { get; set; }
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public string ScriptContent { get; set; }
    public DateTime CreatedDateTime { get; set; }
    public DateTime LastModifiedDateTime { get; set; }
    public string RunAsAccount { get; set; }
    public string FileName { get; set; }
    public List<string> RoleScopeTagIds { get; set; }
    public string AssignmentsODataContext { get; set; }
    public List<Assignment> Assignments { get; set; }
}