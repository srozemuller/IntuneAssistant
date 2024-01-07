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
    public async Task<List<DeviceAndAppManagementAssignmentFilter>?> GetAssignmentFiltersListAsync(string accessToken)
    {
            var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
            var results = new List<DeviceAndAppManagementAssignmentFilter>();
            try
            {
                var result = await graphClient.DeviceManagement.AssignmentFilters.GetAsync(requestConfiguration =>
                {
                    requestConfiguration.QueryParameters.Filter = null;
                });

                if (result?.Value != null)
                    results.AddRange(result.Value);
                    
            }
            catch (ODataError ex)
            {
                Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
                return null;
            }
            return results;
    }

    public async Task<DeviceAndAppManagementAssignmentFilter?> GetAssignmentFilterInfoAsync(string accessToken, string filterId)
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
        string accessToken, string filterId)
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
