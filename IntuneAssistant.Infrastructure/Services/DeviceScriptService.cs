using Newtonsoft.Json;
using IntuneAssistant.Constants;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using IntuneAssistant.Models.Scripts;
using Microsoft.Graph.Beta.Models.ODataErrors;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class DeviceScriptService : IDeviceScriptsService
{
    private readonly HttpClient _http = new();
    public async Task<List<DeviceManagementScriptsModel>?> GetDeviceManagementScriptsListAsync(string? accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<DeviceManagementScriptsModel>();
        try
        {
            var nextUrl = GraphUrls.DeviceManagementScriptsUrl;
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
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<DeviceManagementScriptsModel>>(content);
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

    public async Task<List<DeviceShellScriptModel>?> GetDeviceShellScriptsListAsync(string? accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<DeviceShellScriptModel>();
        try
        {
            var nextUrl = GraphUrls.DeviceShellScriptUrl;
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
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<DeviceShellScriptModel>>(content);
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
    public async Task<List<DeviceHealthScriptsModel>?> GetDeviceHealthScriptsListAsync(string? accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<DeviceHealthScriptsModel>();
        try
        {
            var nextUrl = GraphUrls.DeviceHealthScriptsUrl;
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
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<DeviceHealthScriptsModel>>(content);
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
}