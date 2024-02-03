using Newtonsoft.Json;

namespace IntuneAssistant.Models;

public class DirectoryObjectsModel
{
    [JsonProperty("@odata.type")] 
    public string ODataType { get; set; }
    public string DisplayName { get; set; }
    public string Id { get; set; }
}


public class IdsContainer
{
    [JsonProperty("ids")]
    public List<string> Ids { get; set; }
}