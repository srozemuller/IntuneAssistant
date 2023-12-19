using Newtonsoft.Json;

namespace IntuneAssistant.Models;

public class WindowsLobAppModel
{
    [JsonProperty("@odata.type")]
    public string OdataType { get; set; }
    public string Id { get; set; }
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public string Publisher { get; set; }
    public string CreatedDateTime { get; set; }
    public string LastModifiedDateTime { get; set; }
   public bool IsFeatured { get; set; }
   public bool IsAssigned { get; set; }
}