using System.Net;
using System.Net.Http.Headers;
using IntuneAssistant.Constants;
using IntuneAssistant.Infrastructure.Configuration;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using JsonSerializer = System.Text.Json.JsonSerializer;

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
        var allConfigurationPolicies = new List<ConfigurationPolicy>();
        
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        _graphHttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);


            try
            {
                var response = await _graphHttpClient.GetStreamAsync(nextUrl, default);
                var configurationPolicies =
                    await JsonSerializer.DeserializeAsync<GraphResponse<ConfigurationPolicy>>(
                        response, JsonSerializerConfiguration.Default, default);
                if (configurationPolicies?.Value is null)
                {
                   // nextUrl = null;

                }

                allConfigurationPolicies.AddRange(configurationPolicies.Value.Select(d => d));
                //nextUrl = configurationPolicies.ODataNextLink;
            }
            catch (HttpRequestException e)
            {
                if (e.StatusCode == HttpStatusCode.BadRequest)
                {
                    return null;
                }
                
                //nextUrl = null;
            }
            return allConfigurationPolicies.ToList();
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
        _graphHttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        try
        {
            string nextUrl = $"{Constants.AppConfiguration.GRAPH_URL}/deviceManagement/configurationPolicies('{policyId}')?select=id,name,description" ;
            var response = await _graphHttpClient.GetStreamAsync(nextUrl, default);
            ConfigurationPolicy? configurationPolicies =
                await JsonSerializer.DeserializeAsync<ConfigurationPolicy>(
                    response, JsonSerializerConfiguration.Default, default);
            return configurationPolicies;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
}
