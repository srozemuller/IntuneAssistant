using System.Text;
using IntuneAssistant.Constants;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;
using Newtonsoft.Json;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class TenantInformationService : ITenantInformationService
{
    private readonly HttpClient _http = new();
    public async Task<List<RoleDefinitionModel>?> GetRoleDefinitionsListAsync(string? accessToken)
    {
        var results = new List<RoleDefinitionModel>();
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        try
        {
            var nextUrl = GraphUrls.RoleDefinitionsUrl;
            while (nextUrl is not null)
            {
                try
                {
                    var response = await _http.GetAsync(nextUrl);
                    var responseStream = await response.Content.ReadAsStreamAsync();

                    using var sr = new StreamReader(responseStream);
                    // Read the stream to a string
                    var content = await sr.ReadToEndAsync();

                    // Deserialize the string to your model
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<RoleDefinitionModel>>(content);
                    if (result?.Value is null)
                    {
                        nextUrl = null;
                        continue;
                    }

                    results.AddRange(result.Value);
                    nextUrl = result.ODataNextLink;
                }
                catch (HttpRequestException e)
                {
                    nextUrl = null;
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching roles from Intune: " + ex.ToMessage());
            return null;
        }
        return results;
    }

    public async Task<List<RoleAssignmentModel>?> GetRoleAssignmentsListAsync(string? accessToken, List<RoleDefinitionModel> roles)
    {
        var results = new List<RoleAssignmentModel>();
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        try
        {
            var globalResponse = await _http.GetAsync(GraphUrls.RoleDefinitionsUrl);
            var globalResponseStream = await globalResponse.Content.ReadAsStreamAsync();
            var batchRequestBody = GraphBatchHelper.RoleDefinitionsBatchHelper.CreateOutput(globalResponseStream);
            var content = new StringContent(batchRequestBody, Encoding.UTF8, "application/json");
            var roleDefinitionResponse = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL,content);
            var responseStream = await roleDefinitionResponse.Content.ReadAsStreamAsync();
            using var sr = new StreamReader(responseStream);
            var responseStreamContent = await sr.ReadToEndAsync();

            // Deserialize the string to your model
            var result = JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseForRoleAssignments<RoleAssignmentModel>>>(responseStreamContent);
            if (result?.Responses is not null)
            {
                var roleAssignmentsRequestBody = GraphBatchHelper.RoleAssignmentsBatchHelper.CreateOutput(result.Responses);
                var roleAssignmentsRequestBodyString = new StringContent(roleAssignmentsRequestBody, Encoding.UTF8, "application/json");
                var roleAssignmentsResponse = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL,roleAssignmentsRequestBodyString);
                var roleAssignmentsResponseStream = await roleAssignmentsResponse.Content.ReadAsStreamAsync();
                using var assignmentResponseStream = new StreamReader(roleAssignmentsResponseStream);
                var assignmentResponseStreamContent = await assignmentResponseStream.ReadToEndAsync();
                var assignmentResult = JsonConvert.DeserializeObject<GraphBatchResponse<RoleAssignmentsDetails<RoleAssignmentModel>>>(assignmentResponseStreamContent);
                
                foreach (var resource in assignmentResult.Responses)
                {
                    resource.Body.RoleId = resource.Body.ODataContext.FetchIdFromContext();
                    results.Add(resource.Body);
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching macOS shell script assignments: " + ex.ToMessage());
            return null;
        }
        return results;
    }
}