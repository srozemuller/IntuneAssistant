using IntuneAssistant.Constants;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using IntuneAssistant.Models.Assignments;
using IntuneAssistant.Models.AutoPilot;
using IntuneAssistant.Models.Scripts;
using Microsoft.Graph.Beta.Models.ODataErrors;
using Newtonsoft.Json;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class AutopilotService : IAutoPilotService
{
    private readonly HttpClient _http = new();
    public async Task<List<WindowsAutopilotDeploymentProfileModel>?> GetWindowsAutopilotDeploymentProfilesListAsync(string? accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<WindowsAutopilotDeploymentProfileModel>();
        try
        {
            var nextUrl = GraphUrls.WindowsAutopilotDeploymentProfilesUrl;
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
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<WindowsAutopilotDeploymentProfileModel>>(content);
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
    
    public async Task<List<ResourceAssignmentsModel>?> GetGlobalDeviceEnrollmentForAssignmentsListAsync(string accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<ResourceAssignmentsModel>();

        try
        {
            var nextUrl = $"{GraphUrls.DeviceEnrollmentConfigurationsUrl}";
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
                    var result =
                        JsonConvert.DeserializeObject<GraphValueResponse<ResourceAssignmentsModel>>(content);
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
}