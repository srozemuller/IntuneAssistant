using System.Text;
using Newtonsoft.Json;
using IntuneAssistant.Constants;
using IntuneAssistant.Extensions;
using IntuneAssistant.Helpers;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;
using Spectre.Console;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class ConfigurationPolicyService : IConfigurationPolicyService
{
    private readonly HttpClient _http = new();

    public async Task<List<ConfigurationPolicyModel>?> GetConfigurationPoliciesListAsync(string? accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<ConfigurationPolicyModel>();
        try
        {
            var nextUrl = GraphUrls.ConfigurationPoliciesUrl;
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
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<ConfigurationPolicyModel>>(content);
                    if (result is null)
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

    public async Task<List<DeviceConfigurationModel>?> GetDeviceConfigurationsListAsync(string? accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<DeviceConfigurationModel>();
        try
        {
            var nextUrl = GraphUrls.DeviceConfigurationsUrl;
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
                    //var result = await JsonSerializer.DeserializeAsync<GraphValueResponse<ConfigurationPolicyModel>>(responseStream, CustomJsonOptions.Default());
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<DeviceConfigurationModel>>(content);
                    if (result is null)
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

    public async Task<List<GroupPolicyConfigurationModel>?> GetGroupPolicyConfigurationsListAsync(string? accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<GroupPolicyConfigurationModel>();
        try
        {
            var nextUrl = GraphUrls.GroupPolicyConfigurationsUrl;
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
                    //var result = await JsonSerializer.DeserializeAsync<GraphValueResponse<ConfigurationPolicyModel>>(responseStream, CustomJsonOptions.Default());
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<GroupPolicyConfigurationModel>>(content);
                    if (result is null)
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


    public async Task<List<CustomPolicySettingsModel>?> GetConfigurationPoliciesSettingsListAsync(string? accessToken,
        List<ConfigurationPolicyModel> configurationPolicies)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomPolicySettingsModel>();
        try
        {
            var urlList = new List<string>();
            foreach (var policy in configurationPolicies)
            {
                var policyUrl =
                    $"/deviceManagement/configurationPolicies('{policy.Id}')/settings?$expand=settingDefinitions&top=1000";
                urlList.Add(policyUrl);
            }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                // Read the stream to a string
                var stringContent = await sr.ReadToEndAsync();
                var result =
                    JsonConvert
                        .DeserializeObject<
                            GraphBatchResponse<InnerResponseForAssignments<PolicySettingsDefinitionModel>>>(
                            stringContent, JsonSettings.Default());
                var responsesWithValue = result.Responses.Where(r => r.Body.Value.Any()).ToList();
                foreach (var assignmentResponse in responsesWithValue.Select(r => r).ToList())
                {
                    string n = assignmentResponse.Body.ODataContext.FetchIdFromContext();
                    var sourcePolicy = configurationPolicies.FirstOrDefault(p => p.Id == n);
                    foreach (var setting in assignmentResponse.Body.Value)
                    {
                        var policySettings = setting.ToPolicySettingsModel(sourcePolicy);
                        results.Add(policySettings);
                    }
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


    public async Task<int> CreateConfigurationPolicyAsync(string? accessToken,
        ConfigurationPolicyModel configurationPolicy)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        try
        {
            var nextUrl = GraphUrls.ConfigurationPoliciesAssignmentsUrl;
            var json = JsonConvert.SerializeObject(configurationPolicy);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _http.PostAsync(nextUrl, content);
            if (response.IsSuccessStatusCode)
            {
                AnsiConsole.MarkupLine($"[green]{configurationPolicy.Name} import was successful[/]");
            }
            else
            {
                AnsiConsole.WriteLine($"[red]Request failed for {configurationPolicy.Name}: {response.StatusCode}[/]");
                var message = await response.Content.ReadAsStringAsync();
                var jObject = Newtonsoft.Json.Linq.JObject.Parse(message);
                var innerErrorMessage = jObject["error"]?["innerError"]?["message"]?.ToString();
                AnsiConsole.WriteLine($"[red]Error message: {innerErrorMessage}[/]");
            }
        }
        catch (HttpRequestException e)
        {
            AnsiConsole.WriteLine("\nException Caught!");
            AnsiConsole.WriteLine("Message :{0} ", e.Message);
        }
        catch (Exception e)
        {
            AnsiConsole.WriteLine("\nException Caught!");
            AnsiConsole.WriteLine("Message :{0} ", e.Message);
        }

        return 0;
    }
}