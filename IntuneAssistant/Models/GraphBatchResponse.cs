using Newtonsoft.Json;

namespace IntuneAssistant.Models;

public class GraphBatchResponse<T>
{
    [JsonProperty("responses")]
    public List<T> Responses { get; set; }
}

public class InnerResponseForAssignments
{
    [JsonProperty("id")]
    public string Id { get; set; }

    [JsonProperty("status")]
    public int Status { get; set; }

    [JsonProperty("body")]
    public AssignmentsResponseModel Body { get; set; }
}

public class InnerResponseForRoleAssignments<T>
{
    [JsonProperty("id")]
    public string Id { get; set; }

    [JsonProperty("status")]
    public int Status { get; set; }

    [JsonProperty("body")]
    public InnerResponseBodyRoleAssignmentsBody<T> Body { get; set; }
}

public class RoleAssignmentsDetails<T>
{
    [JsonProperty("id")]
    public string Id { get; set; }

    [JsonProperty("status")]
    public int Status { get; set; }

    [JsonProperty("body")]
    public RoleAssignmentModel Body { get; set; }
}

public class InnerResponseBodyRoleAssignmentsBody<T>
{
    [JsonProperty("@odata.context")]
    public string ODataContext { get; set; }

    [JsonProperty("@odata.count")]
    public int ODataCount { get; set; }

    public IEnumerable<T>? Value { get; set; }
}

