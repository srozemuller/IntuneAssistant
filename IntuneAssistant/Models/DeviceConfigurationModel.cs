using Newtonsoft.Json;

namespace IntuneAssistant.Models;

public class DeviceConfigurationModel
{
    public DateTime? CreatedDateTime { get; set; }
    public string CreationSource { get; set; }
    public string Description { get; set; }
    public DateTime? LastModifiedDateTime { get; set; }
    public string? DisplayName { get; set; }
    public string Platforms { get; set; }
    public object PriorityMetaData { get; set; }
    public List<string> RoleScopeTagIds { get; set; }
    public int SettingCount { get; set; }
    public string Technologies { get; set; }
    public string Id { get; set; }
    public TemplateReference TemplateReference { get; set; }
    
    [JsonProperty("assignments@odata.context")]
    public string AssignmentsOdataContext { get; set; }
    public List<ConfigPolicyAssignment> Assignments { get; set; }
    [JsonProperty("settings@odata.context")]
    public string SettingsOdataContext { get; set; }
    public List<Setting> Settings { get; set; }
}