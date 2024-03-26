using System.Text;
using Newtonsoft.Json;
using IntuneAssistant.Constants;
using IntuneAssistant.Extensions;
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
            var nextUrl = GraphUrls.ConfigurationPoliciesAssignmentsUrl;
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

    
    public async Task<List<CustomPolicySettingsModel>?> GetConfigurationPoliciesSettingsListAsync(string? accessToken, ConfigurationPolicyModel policy)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomPolicySettingsModel>();
        try
        {
            var nextUrl = $"{GraphUrls.ConfigurationPoliciesUrl}('{policy.Id}')/settings?$expand=settingDefinitions&top=1000";

            try
            {
                var response = await _http.GetAsync(nextUrl);
                var responseStream = await response.Content.ReadAsStreamAsync();

                using var sr = new StreamReader(responseStream);
                // Read the stream to a string
                var content = await sr.ReadToEndAsync();

                // Deserialize the string to your model
                var result = JsonConvert.DeserializeObject<GraphValueResponse<PolicySettingsDefinitionModel>>(content);
                if (result?.Value is not null)
                {
                    foreach (var value in result.Value)
                    {
                        var policySettings = value.ToPolicySettingsModel(policy);
                        results.Add(policySettings);
                    }
                }
            }
            catch (HttpRequestException e)
            {

            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching configuration policies: " + ex.ToMessage());
            return null;
        }
        return results;
    }
    

    public async Task<int> CreateConfigurationPolicyAsync(string? accessToken, ConfigurationPolicyModel configurationPolicy)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        try
        {
            var nextUrl = GraphUrls.ConfigurationPoliciesAssignmentsUrl;
            var json = JsonConvert.SerializeObject(configurationPolicy, JsonSettings.Default());
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _http.PostAsync(nextUrl, content);
            if(response.IsSuccessStatusCode)
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
