using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Services;


public sealed class GroupInformationService : IGroupInformationService
{
    public async Task<Group?> GetGroupInformationByIdAsync(string accessToken, string groupId)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var results = await graphClient.Groups[groupId].GetAsync(); 
        return results;
    }

    public async Task<Group?> GetGroupInformationByNameAsync(string accessToken, string groupName)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var allResults = await graphClient.Groups.GetAsync();
        var results = allResults.Value.Where(g => g.DisplayName == groupName).FirstOrDefault();
        return results;
    }
}