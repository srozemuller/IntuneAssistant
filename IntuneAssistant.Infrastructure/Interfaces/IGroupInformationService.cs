using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IGroupInformationService
{
    Task<Group?> GetGroupInformationByIdAsync(string accessToken, string groupId);
    Task<Group?> GetGroupInformationByNameAsync(string accessToken, string groupName);
}