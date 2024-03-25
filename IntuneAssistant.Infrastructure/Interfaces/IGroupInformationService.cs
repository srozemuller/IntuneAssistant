using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IGroupInformationService
{
    Task<GroupModel?> GetGroupInformationByIdAsync(string? accessToken, string groupId);
    Task<GroupModel?> GetGroupInformationByNameAsync(string? accessToken, string groupName);
    Task<List<GroupModel>> GetGroupInformationByIdsCollectionListAsync(string? accessToken, List<string> groupIds);
}