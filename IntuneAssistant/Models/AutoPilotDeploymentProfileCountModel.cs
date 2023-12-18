using Newtonsoft.Json;

namespace IntuneAssistant.Models;

public class AutoPilotDeploymentProfileCountModel
{
    [JsonProperty("@odata.type")]
    public string OdataType { get; set; }
    [JsonProperty("@odata.count")]
    public int OdataCount { get; set; }
}

