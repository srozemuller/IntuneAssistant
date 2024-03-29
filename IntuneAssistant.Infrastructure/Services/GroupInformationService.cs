using System.Text.Json;
using IntuneAssistant.Constants;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;

namespace IntuneAssistant.Infrastructure.Services;


public sealed class GroupInformationService : IGroupInformationService
{
    private readonly HttpClient _http = new();
    public async Task<GroupModel?> GetGroupInformationByIdAsync(string? accessToken, string groupId)
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

    public async Task<GroupModel?> GetGroupInformationByNameAsync(string? accessToken, string groupName)
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

    public async Task<List<GroupModel>> GetGroupInformationByIdsCollectionListAsync(string? accessToken,
        List<string> groupIds)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var allResults = new List<GroupModel>();

        // In a search filter there is a max of 15 operators. In the case there are more groups, loop through the list with a max of 15
        while (groupIds.Count > 0)
        {
            var currentIds = groupIds.Take(15).ToList();
            var currentIdsInString = "(" + string.Join(",", currentIds.Select(x => $"'{x}'")) + ")";
            var url = $"{GraphUrls.GroupsUrl}&$filter=id in {currentIdsInString}";
            try
            {
                var response = await _http.GetAsync(url);
                var responseStream = await response.Content.ReadAsStreamAsync();
                var result =
                    await JsonSerializer.DeserializeAsync<GraphValueResponse<GroupModel>>(responseStream,
                        CustomJsonOptions.Default());

                groupIds = groupIds.Skip(15).ToList();
                if (result?.Value is not null)
                {
                    allResults.AddRange(result.Value);
                }
            }
            catch
            {
                return null;
            }
        }
        return allResults;
        }
}