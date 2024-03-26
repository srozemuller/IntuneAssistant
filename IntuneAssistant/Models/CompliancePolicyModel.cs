using Newtonsoft.Json;

namespace IntuneAssistant.Models;

public class CompliancePolicyModel
{
    [JsonProperty("@odata.type")]
    public string OdataType { get; set; }
    public List<string> RoleScopeTagIds { get; set; }
    public string Id { get; set; }
    public DateTime CreatedDateTime { get; set; }
    public string Description { get; set; }
    public DateTime LastModifiedDateTime { get; set; }
    public string? DisplayName { get; set; }
    public List<string> ValidOperatingSystemBuildRanges { get; set; }
    [JsonProperty("assignments@odata.context")]
    public string AssignmentsOdataContext { get; set; }
    public List<CompliancePolicyAssignment> Assignments { get; set; }
}

public class CompliancePolicyAssignment : IAssignment
{
    public string Id { get; set; }
    public string Source { get; set; }
    public string SourceId { get; set; }
    public Target Target { get; set; }
}