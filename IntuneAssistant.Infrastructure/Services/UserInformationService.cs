using Newtonsoft.Json;
using IntuneAssistant.Constants;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using IntuneAssistant.Models.Group;
using IntuneAssistant.Models.Users;

namespace IntuneAssistant.Infrastructure.Services;


public sealed class UserInformationService : IUserInformationService
{
    private readonly HttpClient _http = new();
    public async Task<UserModel?> GetUserInformationByIdAsync(string? accessToken, Guid groupId)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        
        var results = new UserModel();
        try
        {
            var url = $"{GraphUrls.GroupsUrl}?$select=id,displayname,Description,CreatedDateTime&$filter=id eq '{groupId}'";
            var response = await _http.GetAsync(url);
            var responseStream = await response.Content.ReadAsStreamAsync();
            using var sr = new StreamReader(responseStream);
            // Read the stream to a string
            var content = await sr.ReadToEndAsync();
            // Deserialize the string to your model
            var result = JsonConvert.DeserializeObject<GraphValueResponse<UserModel>>(content);
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

    public async Task<UserModel?> GetUserInformationByNameAsync(string? accessToken, string userName)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var url = $"{GraphUrls.GroupsUrl}?$select=id,displayname,Description,CreatedDateTime&$filter=displayName eq '{userName}'";
        var results = new UserModel();
        try
        {
            var response = await _http.GetAsync(url);
            var responseStream = await response.Content.ReadAsStreamAsync();
            using var sr = new StreamReader(responseStream);
            // Read the stream to a string
            var content = await sr.ReadToEndAsync();
            // Deserialize the string to your model
            var result = JsonConvert.DeserializeObject<GraphValueResponse<UserModel>>(content);
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

    public async Task<List<UserModel>> GetUserInformationByIdsCollectionListAsync(string? accessToken,
        List<string> userIds)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var allResults = new List<UserModel>();

        // In a search filter there is a max of 15 operators. In the case there are more groups, loop through the list with a max of 15
        while (userIds.Count > 0)
        {
            var currentIds = userIds.Take(15).ToList();
            var currentIdsInString = "(" + string.Join(",", currentIds.Select(x => $"'{x}'")) + ")";
            var url = $"{GraphUrls.UsersUrl}?$select=id,displayname,accountEnabled,userType,createdDate,state&$filter=id in {currentIdsInString}";
            try
            {
                var response = await _http.GetAsync(url);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                // Read the stream to a string
                var content = await sr.ReadToEndAsync();
                // Deserialize the string to your model
                var result = JsonConvert.DeserializeObject<GraphValueResponse<UserModel>>(content);

                userIds = userIds.Skip(15).ToList();
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