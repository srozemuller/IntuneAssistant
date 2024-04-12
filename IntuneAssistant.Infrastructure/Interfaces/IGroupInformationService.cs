using IntuneAssistant.Models;
using IntuneAssistant.Models.Group;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IGroupInformationService
{
    Task<GroupModel?> GetGroupInformationByIdAsync(string? accessToken, string groupId);
    Task<GroupModel?> GetGroupInformationByNameAsync(string? accessToken, string groupName);
    Task<List<GroupMemberModel>?> GetGroupMembersListByGroupIdAsync(string? accessToken, string groupId);
    Task<List<GroupModel>> GetGroupInformationByIdsCollectionListAsync(string? accessToken, List<string> groupIds);
}