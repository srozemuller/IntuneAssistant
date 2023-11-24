using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Services;


public sealed class GroupInformationService : IGroupInformationService
{

    public async Task<Group?> GetGroupInformationByIdAsync(string accessToken, string groupId)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var results = new Group();
        try
        {
            results = await graphClient.Groups[groupId].GetAsync();
        }
        catch
        {
            return null;
        }

        return results;
    }

    public async Task<Group?> GetGroupInformationByNameAsync(string accessToken, string groupName)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var allResults = await graphClient.Groups.GetAsync();
        var results = allResults.Value.Where(g => g.DisplayName == groupName).FirstOrDefault();
        return results;
    }

    public async Task<List<Group?>> GetGroupInformationByIdsCollectionListAsync(string accessToken,
        List<string> groupIds)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var allResults = new List<Group>();
        var groupResults = new Group();
        foreach (var groupId in groupIds)
        {
            groupResults = await graphClient.Groups[groupId].GetAsync();
            if (groupResults is not null)
            {
                allResults.Add(groupResults);
            }
        }

        return allResults;
        }
}