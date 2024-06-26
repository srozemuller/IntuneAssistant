using System.Text;
using Newtonsoft.Json;
using IntuneAssistant.Constants;
using IntuneAssistant.Extensions;
using IntuneAssistant.Helpers;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Interfaces.Logging;
using IntuneAssistant.Models;
using IntuneAssistant.Models.Devices;
using Microsoft.Extensions.Logging;
using Microsoft.Graph.Beta.Models.ODataErrors;
using Spectre.Console;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class ConfigurationPolicyService : IConfigurationPolicyService
{
    private readonly HttpClient _http = new();
    private readonly ILogger<ConfigurationPolicyService> _logger;
    private readonly IApplicationInsightsService _applicationInsightsService;

    public ConfigurationPolicyService(ILogger<ConfigurationPolicyService> logger,
        IApplicationInsightsService applicationInsightsService)
    {
        _logger = logger;
        _applicationInsightsService = applicationInsightsService;
    }

    public async Task<List<ConfigurationPolicyModel>?> GetConfigurationPoliciesListAsync(string? accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<ConfigurationPolicyModel>();
        _logger.LogInformation("Getting configuration policies list");
        var nextUrl = $"{GraphUrls.ConfigurationPoliciesUrl}?expand=assignments";
        while (nextUrl is not null)
        {
            try
            {
                var response = await _http.GetAsync(nextUrl);
                // Ensure we got a successful response
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Error: {response.StatusCode}");
                    throw new HttpRequestException(
                        $"Request to {nextUrl} failed with status code {response.StatusCode}");
                }

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

                if (result.Value != null) results.AddRange(result.Value);
                nextUrl = result.ODataNextLink;
            }
            catch (HttpRequestException e)
            {
                // Handle HttpRequestException (a subclass of IOException)
                _logger.LogError("Error: {ResponseStatusCode}", e.Message);
                // Send the error details to Application Insights
                var customException = new ExceptionHelper.CustomException(e.Message, nextUrl, e.StackTrace);

                // Send the custom exception details to Application Insights
                await _applicationInsightsService.TrackExceptionAsync(customException);
                await _applicationInsightsService.TrackTraceAsync(customException);
                Console.WriteLine($"Request error: {customException}");
                nextUrl = null;
            }
            catch (TaskCanceledException e)
            {
                // Handle timeouts (TaskCanceledException is thrown when the request times out)
                Console.WriteLine(e.CancellationToken.IsCancellationRequested
                    ? "Request was canceled."
                    : "Request timed out.");
                _logger.LogError("Error: {ResponseStatusCode}", e.CancellationToken.IsCancellationRequested);
            }
            catch (Exception e)
            {
                // Handle other exceptions
                Console.WriteLine($"An error occurred: {e.Message}");
                var jsonException = new ExceptionHelper.CustomJsonException(e.Message, nextUrl, e.StackTrace);
                    
                await _applicationInsightsService.TrackJsonExceptionAsync(jsonException);
                await _applicationInsightsService.TrackJsonTraceAsync(jsonException);
                _logger.LogError("Error: {ResponseStatusCode}", e.InnerException);
            }
        }


        return results;
    }

    public async Task<List<DeviceConfigurationModel>?> GetDeviceConfigurationsListAsync(string? accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<DeviceConfigurationModel>();
        var nextUrl = GraphUrls.DeviceConfigurationsUrl;
        try
        {
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
        catch (HttpRequestException e)
        {
            // Handle HttpRequestException (a subclass of IOException)
            _logger.LogError("Error: {ResponseStatusCode}", e.Message);
            // Send the error details to Application Insights
            var customException = new ExceptionHelper.CustomException(e.Message, nextUrl, e.StackTrace);

            // Send the custom exception details to Application Insights
            await _applicationInsightsService.TrackExceptionAsync(customException);
            await _applicationInsightsService.TrackTraceAsync(customException);
            Console.WriteLine($"Request error: {customException}");
        }
        catch (TaskCanceledException e)
        {
            // Handle timeouts (TaskCanceledException is thrown when the request times out)
            Console.WriteLine(e.CancellationToken.IsCancellationRequested
                ? "Request was canceled."
                : "Request timed out.");
            _logger.LogError("Error: {ResponseStatusCode}", e.CancellationToken.IsCancellationRequested);
        }
        catch (Exception e)
        {
            // Handle other exceptions
            Console.WriteLine($"An error occurred: {e.Message}");
            var jsonException = new ExceptionHelper.CustomJsonException(e.Message, nextUrl, e.StackTrace);
                    
            await _applicationInsightsService.TrackJsonExceptionAsync(jsonException);
            await _applicationInsightsService.TrackJsonTraceAsync(jsonException);
            _logger.LogError("Error: {ResponseStatusCode}", e.InnerException);
        }

        return results;
    }

    public async Task<ConfigurationPolicyModel>? GetConfigurationPolicyByIdAsync(string? accessToken, string policyId)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new ConfigurationPolicyModel();
        var nextUrl =
            $"{GraphUrls.ConfigurationPoliciesUrl}('{policyId}')?$expand=assignments,settings($expand=settingDefinitions)";
        try
        {
            while (nextUrl is not null)
            {
                var response = await _http.GetAsync(nextUrl);
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Error: {response.StatusCode}");
                    throw new HttpRequestException(
                        $"Request to {nextUrl} failed with status code {response.StatusCode}");
                }

                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                // Read the stream to a string
                var content = await sr.ReadToEndAsync();

                    // Deserialize the string to your model
                    var result = JsonConvert.DeserializeObject<ConfigurationPolicyModel>(content);
                    if (result is null)
                    {
                        nextUrl = null;
                        continue;
                    }

                    return result;

            }
        }
        catch (HttpRequestException e)
        {
            // Handle HttpRequestException (a subclass of IOException)
            _logger.LogError("Error: {ResponseStatusCode}", e.Message);
            // Send the error details to Application Insights
            var customException = new ExceptionHelper.CustomException(e.Message, nextUrl, e.StackTrace);

            // Send the custom exception details to Application Insights
            await _applicationInsightsService.TrackExceptionAsync(customException);
            await _applicationInsightsService.TrackTraceAsync(customException);
            Console.WriteLine($"Request error: {customException}");
            nextUrl = null;
        }
        catch (TaskCanceledException e)
        {
            // Handle timeouts (TaskCanceledException is thrown when the request times out)
            Console.WriteLine(e.CancellationToken.IsCancellationRequested
                ? "Request was canceled."
                : "Request timed out.");
            _logger.LogError("Error: {ResponseStatusCode}", e.CancellationToken.IsCancellationRequested);
        }
        catch (Exception e)
        {
            // Handle other exceptions
            Console.WriteLine($"An error occurred: {e.Message}");
            var jsonException = new ExceptionHelper.CustomJsonException(e.Message, nextUrl, e.StackTrace);
                    
            await _applicationInsightsService.TrackJsonExceptionAsync(jsonException);
            await _applicationInsightsService.TrackJsonTraceAsync(jsonException);
            _logger.LogError("Error: {ResponseStatusCode}", e.InnerException);
        }

        return results;
    }

    public async Task<List<GroupPolicyConfigurationModel>?> GetGroupPolicyConfigurationsListAsync(string? accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<GroupPolicyConfigurationModel>();
        var nextUrl = GraphUrls.GroupPolicyConfigurationsUrl;
        try
        {
            while (nextUrl is not null)
            {
                var response = await _http.GetAsync(nextUrl);
                    var responseStream = await response.Content.ReadAsStreamAsync();
                    using var sr = new StreamReader(responseStream);
                    // Read the stream to a string
                    var content = await sr.ReadToEndAsync();
                    // Deserialize the string to your model
                    //var result = await JsonSerializer.DeserializeAsync<GraphValueResponse<ConfigurationPolicyModel>>(responseStream, CustomJsonOptions.Default());
                    var result =
                        JsonConvert.DeserializeObject<GraphValueResponse<GroupPolicyConfigurationModel>>(content);
                    if (result is null)
                    {
                        nextUrl = null;
                        continue;
                    }

                    results.AddRange(result.Value);
                    nextUrl = result.ODataNextLink;

            }
        }
        catch (HttpRequestException e)
        {
            // Handle HttpRequestException (a subclass of IOException)
            _logger.LogError("Error: {ResponseStatusCode}", e.Message);
            // Send the error details to Application Insights
            var customException = new ExceptionHelper.CustomException(e.Message, nextUrl, e.StackTrace);

            // Send the custom exception details to Application Insights
            await _applicationInsightsService.TrackExceptionAsync(customException);
            await _applicationInsightsService.TrackTraceAsync(customException);
            Console.WriteLine($"Request error: {customException}");
        }
        catch (TaskCanceledException e)
        {
            // Handle timeouts (TaskCanceledException is thrown when the request times out)
            Console.WriteLine(e.CancellationToken.IsCancellationRequested
                ? "Request was canceled."
                : "Request timed out.");
            _logger.LogError("Error: {ResponseStatusCode}", e.CancellationToken.IsCancellationRequested);
        }
        catch (Exception e)
        {
            // Handle other exceptions
            Console.WriteLine($"An error occurred: {e.Message}");
            var jsonException = new ExceptionHelper.CustomJsonException(e.Message, nextUrl, e.StackTrace);
                    
            await _applicationInsightsService.TrackJsonExceptionAsync(jsonException);
            await _applicationInsightsService.TrackJsonTraceAsync(jsonException);
            _logger.LogError("Error: {ResponseStatusCode}", e.InnerException);
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
        catch (HttpRequestException e)
        {
            // Handle HttpRequestException (a subclass of IOException)
            _logger.LogError("Error: {ResponseStatusCode}", e.Message);
            // Send the error details to Application Insights
            var customException = new ExceptionHelper.CustomException(e.Message, null, e.StackTrace);

            // Send the custom exception details to Application Insights
            await _applicationInsightsService.TrackExceptionAsync(customException);
            await _applicationInsightsService.TrackTraceAsync(customException);
            Console.WriteLine($"Request error: {customException}");
        }
        catch (TaskCanceledException e)
        {
            // Handle timeouts (TaskCanceledException is thrown when the request times out)
            Console.WriteLine(e.CancellationToken.IsCancellationRequested
                ? "Request was canceled."
                : "Request timed out.");
            _logger.LogError("Error: {ResponseStatusCode}", e.CancellationToken.IsCancellationRequested);
        }
        catch (Exception e)
        {
            // Handle other exceptions
            Console.WriteLine($"An error occurred: {e.Message}");
            var jsonException = new ExceptionHelper.CustomJsonException(e.Message, null, e.StackTrace);
                    
            await _applicationInsightsService.TrackJsonExceptionAsync(jsonException);
            await _applicationInsightsService.TrackJsonTraceAsync(jsonException);
            _logger.LogError("Error: {ResponseStatusCode}", e.InnerException);
        }

        return results;
    }


    public async Task<int> CreateConfigurationPolicyAsync(string? accessToken,
        ConfigurationPolicyModel configurationPolicy)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var nextUrl = GraphUrls.ConfigurationPoliciesAssignmentsUrl;
        try
        {

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
            // Handle HttpRequestException (a subclass of IOException)
            _logger.LogError("Error: {ResponseStatusCode}", e.Message);
            // Send the error details to Application Insights
            var customException = new ExceptionHelper.CustomException(e.Message, nextUrl, e.StackTrace);

            // Send the custom exception details to Application Insights
            await _applicationInsightsService.TrackExceptionAsync(customException);
            await _applicationInsightsService.TrackTraceAsync(customException);
            Console.WriteLine($"Request error: {customException}");
        }
        catch (TaskCanceledException e)
        {
            // Handle timeouts (TaskCanceledException is thrown when the request times out)
            Console.WriteLine(e.CancellationToken.IsCancellationRequested
                ? "Request was canceled."
                : "Request timed out.");
            _logger.LogError("Error: {ResponseStatusCode}", e.CancellationToken.IsCancellationRequested);
        }
        catch (Exception e)
        {
            // Handle other exceptions
            Console.WriteLine($"An error occurred: {e.Message}");
            var jsonException = new ExceptionHelper.CustomJsonException(e.Message, nextUrl, e.StackTrace);
                    
            await _applicationInsightsService.TrackJsonExceptionAsync(jsonException);
            await _applicationInsightsService.TrackJsonTraceAsync(jsonException);
            _logger.LogError("Error: {ResponseStatusCode}", e.InnerException);
        }

        return 0;
    }
}