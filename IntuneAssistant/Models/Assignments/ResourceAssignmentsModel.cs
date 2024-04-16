using Newtonsoft.Json;

namespace IntuneAssistant.Models.Assignments;

public class ResourceAssignmentsModel
{
    [JsonProperty("@odata.type")]
    public string ODataType { get; set; }
    public string ODataContext { get; set; }
    public string Id { get; set; }
    public string DisplayName { get; set; }
    public string AssignmentsODataContext { get; set; }
    public List<Assignment> Assignments { get; set; }
}