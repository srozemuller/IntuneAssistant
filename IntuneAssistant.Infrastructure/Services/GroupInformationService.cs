using System.Text.Json;
using IntuneAssistant.Constants;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;

namespace IntuneAssistant.Infrastructure.Services;


public sealed class GroupInformationService : IGroupInformationService
{
    private readonly HttpClient _http = new();
    public async Task<GroupModel?> GetGroupInformationByIdAsync(string accessToken, string groupId)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        
        var results = new GroupModel();
        try
        {
            var url = $"{GraphUrls.GroupsUrl}&$filter=id eq '{groupId}'";
            var response = await _http.GetAsync(url);
            var responseStream = await response.Content.ReadAsStreamAsync();
            var result = await JsonSerializer.DeserializeAsync<GraphValueResponse<GroupModel>>(responseStream, CustomJsonOptions.Default());
            if (result?.Value is not null)
            {
                return result.Value.FirstOrDefault();
            }
        }
        catch
        {
            return null;
        }
        return results;
    }

    public async Task<GroupModel?> GetGroupInformationByNameAsync(string accessToken, string groupName)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var url = $"{GraphUrls.GroupsUrl}&$filter=displayName eq '{groupName}'";
        var results = new GroupModel();
        try
        {
            var response = await _http.GetAsync(url);
            var responseStream = await response.Content.ReadAsStreamAsync();
            var result =
                await JsonSerializer.DeserializeAsync<GraphValueResponse<GroupModel>>(responseStream,
                    CustomJsonOptions.Default());
            if (result?.Value is not null)
            {
                return result.Value.FirstOrDefault();
            }
        }
        catch (Exception exception)
        {
            return null;
        }
        return results;
    }

    public async Task<List<GroupModel>> GetGroupInformationByIdsCollectionListAsync(string accessToken,
        List<string> groupIds)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var groupIdsInString = "(" + string.Join(",", groupIds.Select(x => $"'{x}'")) + ")";
        var url = $"{GraphUrls.GroupsUrl}&$filter=id in {groupIdsInString}";
        var allResults = new List<GroupModel>();
        try
        {
            var response = await _http.GetAsync(url);
            var responseStream = await response.Content.ReadAsStreamAsync();
            var result =
                await JsonSerializer.DeserializeAsync<GraphValueResponse<GroupModel>>(responseStream,
                    CustomJsonOptions.Default());
            if (result?.Value is not null)
            {
                return result.Value.ToList();
            }
        }
        catch
        {
            return null;
        }

        return allResults;
        }
}