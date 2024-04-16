namespace IntuneAssistant.Models.Scripts;

public class DeviceShellScriptModel
{
    public string ODataContext { get; set; }
    public string ExecutionFrequency { get; set; }
    public int RetryCount { get; set; }
    public bool BlockExecutionNotifications { get; set; }
    public string Id { get; set; }
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public string ScriptContent { get; set; }
    public DateTime CreatedDateTime { get; set; }
    public DateTime LastModifiedDateTime { get; set; }
    public string RunAsAccount { get; set; }
    public string FileName { get; set; }
    public List<string> RoleScopeTagIds { get; set; }
}