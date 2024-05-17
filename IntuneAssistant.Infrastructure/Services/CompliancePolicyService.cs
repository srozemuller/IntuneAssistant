using IntuneAssistant.Constants;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;
using Newtonsoft.Json;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class CompliancePolicyService : ICompliancePoliciesService
{
    private readonly HttpClient _http = new();
 
    public async Task<List<CompliancePolicyModel>?> GetCompliancePoliciesListAsync(string? accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
            var results = new List<CompliancePolicyModel>();
            try
            {
                var nextUrl = GraphUrls.CompliancePoliciesUrl;
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
                        var result = JsonConvert.DeserializeObject<GraphValueResponse<CompliancePolicyModel>>(content);
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
                Console.WriteLine("An exception has occurred while fetching configuration policies: " + ex.ToMessage());
                return null;
            }
            return results;
    }

    public async Task<DeviceComplianceDeviceStatusCollectionResponse> GetCompliancePolicyDeviceStatusAsync(string? accessToken, string policyId)
    {
        try
        {
            var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
            var result = await graphClient.DeviceManagement.DeviceCompliancePolicies[policyId].DeviceStatuses
                .GetAsync();
            return result;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
}
