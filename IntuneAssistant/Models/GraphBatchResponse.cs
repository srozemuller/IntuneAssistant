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


