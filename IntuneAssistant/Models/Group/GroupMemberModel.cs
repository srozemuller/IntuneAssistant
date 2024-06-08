using IntuneAssistant.Helpers;
using Newtonsoft.Json;

namespace IntuneAssistant.Models.Group;

public class GroupMemberModel
{
    [JsonProperty ("@odata.type")]
    public string ODataType { get; set; }
    public Guid Id { get; init; } = Guid.Empty;
    public bool AccountEnabled { get; set; }
    public string DisplayName { get; set; } = String.Empty;
    public string CreatedDateTime { get; set; } = String.Empty;
    public string Type { get; set; } = String.Empty;
}


public static class GroupMemberModelExtensions
{
    public static GroupMemberModel ToGroupMemberModel(this GroupMemberModel member)
    {
        var resourceTypeString = ResourceHelper.GetResourceTypeFromOdata(member.ODataType);
        
        return new GroupMemberModel
        {
            ODataType = member.ODataType,
            Id = member.Id,
            AccountEnabled = member.AccountEnabled,
            DisplayName = member.DisplayName,
            CreatedDateTime = member.CreatedDateTime,
            Type = resourceTypeString
                
        };
    }
    
} 