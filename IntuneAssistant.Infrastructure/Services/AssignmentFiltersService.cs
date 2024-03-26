using System.Text.Json;
using IntuneAssistant.Constants;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Responses;
using IntuneAssistant.Models;
using Microsoft.Graph.Beta.DeviceManagement.EvaluateAssignmentFilter;
using Microsoft.Graph.Beta.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;


namespace IntuneAssistant.Infrastructure.Services;

public sealed class AssignmentFiltersService : IAssignmentFiltersService
{
    private readonly HttpClient _http = new();
    public async Task<List<AssignmentFiltersModel>?> GetAssignmentFiltersListAsync(string? accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
            var results = new List<AssignmentFiltersModel>();
            try
            {
                var url = GraphUrls.AssignmentFiltersUrl;
                var response = await _http.GetAsync(url);
                var responseStream = await response.Content.ReadAsStreamAsync();
                var result = await JsonSerializer.DeserializeAsync<GraphValueResponse<AssignmentFiltersModel>>(responseStream, CustomJsonOptions.Default());
                if (result?.Value is not null)
                {
                    return result.Value.ToList();
                }
            }
            catch
            {
                return null;
            }
            return results;
    }

    public async Task<DeviceAndAppManagementAssignmentFilter?> GetAssignmentFilterInfoAsync(string? accessToken, string filterId)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var result = new DeviceAndAppManagementAssignmentFilter();
        try
        {
            result = await graphClient.DeviceManagement.AssignmentFilters[filterId].GetAsync();
            return result;
           
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
            return null;
        }
    }

    public async Task<AssignmentFiltersDeviceEvaluationResponse> GetAssignmentFilterDeviceListAsync(
        string? accessToken, string filterId)
    { 
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var filterInfo = await GetAssignmentFilterInfoAsync(accessToken, filterId);
        try
        {
            if (filterInfo is not null)
            {
                var requestBody = new AssignmentFilterEvaluateRequest
                {
                    Platform = filterInfo.Platform,
                    Rule = filterInfo.Rule

                };
                var postBody = new EvaluateAssignmentFilterPostRequestBody();
                postBody.Data = requestBody;
                var result = await graphClient.DeviceManagement.EvaluateAssignmentFilter.PostAsync(postBody);
                //var sr = new StreamReader(result);
                //var x = await sr.ReadToEndAsync();
                if (result is not null)
                {
                    var jsonResult =
                        await JsonSerializer.DeserializeAsync<AssignmentFiltersDeviceEvaluationResponse>(result);
                    return jsonResult;
                }
                else
                {
                    Console.WriteLine($"No devices found in filter {filterInfo.DisplayName} ");
                    return null;
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
            return null;
        }
        return null;
    }
}
