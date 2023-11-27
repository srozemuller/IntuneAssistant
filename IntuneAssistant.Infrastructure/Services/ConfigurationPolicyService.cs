using System.Net;
using System.Net.Http.Headers;
using Az.Avd.Core.Helpers;
using IntuneAssistant.Constants;
using IntuneAssistant.Infrastructure.Configuration;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models;
using System.Text.Json;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class ConfigurationPolicyService : IConfigurationPolicyService
{
    private readonly HttpClient _http = new();
    private readonly HttpClient _graphHttpClient;
    public ConfigurationPolicyService(

        IHttpClientFactory httpClientFactory)
    {

        _graphHttpClient = httpClientFactory.CreateClient("test");
    }
    
    public async Task<List<ConfigurationPolicy>?> GetConfigurationPoliciesListAsync(string accessToken, bool assignmentFilter)
    {
        var nextUrl = GraphUris.ConfigurationPolicies;
        var saveChanges = true;
        var remoteManagedDevices = new List<ConfigurationPolicy>();
        
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        _graphHttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        while (nextUrl is not null)
        {
            try
            {
                var response = await _graphHttpClient.GetStreamAsync(nextUrl,default);
                //var responseStream = await response.Content.ReadAsStreamAsync();
                var result = await JsonSerializer.DeserializeAsync<GraphResponse<ConfigurationPolicy>?>(response, JsonSerializerConfiguration.Default);

                //
                // if (result?.Value is null)
                // {
                //     nextUrl = null;
                //     continue;
                // }
                //
                // // remoteManagedDevices.AddRange(result.Value.Select(d => d.ToManagedDevice(tenantId, d.Id)));
                // nextUrl = result.ODataNextLink;
            }
            catch (HttpRequestException e)
            {
                if (e.StatusCode == HttpStatusCode.BadRequest)
                {
                    return null;
                }
                
                nextUrl = null;
                saveChanges = false;
            }
        }

        if (!saveChanges)
        {
            return null;
        }
        

        return remoteManagedDevices.Select(d => d).ToList();
    }

    public async Task<ConfigurationPolicy?> GetConfigurationPolicyByIdAsync(string accessToken, string policyId)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        try
        {
            string url = $"{Constants.AppConfiguration.GRAPH_URL}/deviceManagement/configurationPolicies('{policyId}')" ;
            var response = await _http.GetAsync(url);
            var responseStream = await response.Content.ReadAsStreamAsync();
            ConfigurationPolicy? result = await JsonSerializer.DeserializeAsync<ConfigurationPolicy>(responseStream, JsonSerializerConfiguration.Default);
            return result;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    public async Task<ConfigurationPolicy?> GetConfigurationPolicySettingsByIdAsync(string accessToken, string policyId)
    {
        try
        {
            string url = $"{Constants.AppConfiguration.GRAPH_URL}/deviceManagement/configurationPolicies('{policyId}')?$expand=settings" ;
            var response = await _http.GetAsync(url);
            var responseStream = await response.Content.ReadAsStreamAsync();
            ConfigurationPolicy? result = await JsonSerializer.DeserializeAsync<ConfigurationPolicy>(responseStream, JsonSerializerConfiguration.Default);
            return result;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
}
