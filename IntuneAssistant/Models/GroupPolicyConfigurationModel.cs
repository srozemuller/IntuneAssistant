using Newtonsoft.Json;

namespace IntuneAssistant.Models;

public class GroupPolicyConfigurationModel
{
    [JsonProperty("@odata.type")]
    public string OdataType { get; set; }
    public DateTime? CreatedDateTime { get; set; }
    public string Description { get; set; }
    public DateTime? LastModifiedDateTime { get; set; }
    public string? DisplayName { get; set; }
    public List<string> RoleScopeTagIds { get; set; }
    public string policyConfigurationIngestionType { get; set; }
    public string Id { get; set; }
    [JsonProperty("assignments@odata.context")]
    public string AssignmentsOdataContext { get; set; }
    public List<ConfigPolicyAssignment> Assignments { get; set; }
}