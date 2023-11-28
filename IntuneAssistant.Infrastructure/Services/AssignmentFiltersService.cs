using System.Text.Json;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Responses;
using Microsoft.Graph.Beta.DeviceManagement.EvaluateAssignmentFilter;
using Microsoft.Graph.Beta.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;


namespace IntuneAssistant.Infrastructure.Services;

public sealed class AssignmentFiltersService : IAssignmentFiltersService
{
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

                if (result?.Value?.Select(r => r) != null)
                    results.AddRange(result.Value);
                return results;
                    
            }
            catch (ODataError ex)
            {
                Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
                return null;
            }
    }

    public async Task<DeviceAndAppManagementAssignmentFilter?>? GetAssignmentFilterInfoAsync(string accessToken, string filterId)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        try
        {
            var result = await graphClient.DeviceManagement.AssignmentFilters[filterId].GetAsync();
            return result;
        }
        catch (ODataError ex)
        {
            Console.WriteLine($"An exception has occurred while fetching filter with ID {filterId}: " + ex.ToMessage());
            return null;
        }
    }
    
    public async Task<AssignmentFiltersDeviceEvaluationResponse?> GetAssignmentFilterDeviceListAsync(
        string accessToken, string filterId)
    { 
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var assignmentFilterResult = await graphClient.DeviceManagement.AssignmentFilters[filterId].GetAsync();
        try
        {
            if (assignmentFilterResult is not null)
            {
                var requestBody = new AssignmentFilterEvaluateRequest
                {
                    Platform = assignmentFilterResult.Platform,
                    Rule = assignmentFilterResult.Rule

                };
                var postBody = new EvaluateAssignmentFilterPostRequestBody();
                postBody.Data = requestBody;
                var result = await graphClient.DeviceManagement.EvaluateAssignmentFilter.PostAsync(postBody);
                if (result is not null)
                {
                    var jsonResult =
                        await JsonSerializer.DeserializeAsync<AssignmentFiltersDeviceEvaluationResponse>(result);
                    return jsonResult;
                }
                Console.WriteLine($"No devices found in filter {assignmentFilterResult.DisplayName} ");
                return null;
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
