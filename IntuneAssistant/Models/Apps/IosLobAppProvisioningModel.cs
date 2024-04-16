namespace IntuneAssistant.Models.Apps;

public class IosLobAppProvisioningModel
{
    public string ODataType { get; set; }
    public string Id { get; set; }
    public DateTime ExpirationDateTime { get; set; }
    public string PayloadFileName { get; set; }
    public string Payload { get; set; }
    public List<string> RoleScopeTagIds { get; set; }
    public DateTime CreatedDateTime { get; set; }
    public string Description { get; set; }
    public DateTime LastModifiedDateTime { get; set; }
    public string DisplayName { get; set; }
    public int Version { get; set; }
}