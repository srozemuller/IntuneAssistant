using Newtonsoft.Json;

namespace IntuneAssistant.Models;

public class RoleAssignmentModel
{
    [JsonProperty("@odata.context")]
    public string ODataContext { get; set; }
    
    [JsonProperty("@odata.type")]
    public string OdataType { get; set; }
    public string RoleId { get; set; }
    public string Id { get; set; }
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public List<object> ScopeMembers { get; set; }
    public string ScopeType { get; set; }
    public List<object> ResourceScopes { get; set; }
    public List<object> Members { get; set; }
}