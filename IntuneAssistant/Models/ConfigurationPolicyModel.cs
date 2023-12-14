using Newtonsoft.Json;

namespace IntuneAssistant.Models;
public class ConfigurationPolicyModel
{
    public DateTime? CreatedDateTime { get; set; }
    public string CreationSource { get; set; }
    public string Description { get; set; }
    public DateTime? LastModifiedDateTime { get; set; }
    public string Name { get; set; }
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

public class TemplateReference
{
    public string TemplateId { get; set; }
    public string TemplateFamily { get; set; }
    public string TemplateDisplayName { get; set; }
    public string TemplateDisplayVersion { get; set; }
}

public class ConfigPolicyAssignment : IAssignment
{
    public string Id { get; set; }
    public Target Target { get; set; }
}

public class ChoiceSettingValue
{
    public object SettingValueTemplateReference { get; set; }
    public string Value { get; set; }
    public List<object> Children { get; set; }
}

public class SettingInstance
{
    [JsonProperty("@odata.type")]
    public string OdataType { get; set; }
    public string SettingDefinitionId { get; set; }
    public object SettingInstanceTemplateReference { get; set; }
    public ChoiceSettingValue ChoiceSettingValue { get; set; }
}

public class Setting
{
    public string Id { get; set; }
    public SettingInstance SettingInstance { get; set; }
}
