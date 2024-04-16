using IntuneAssistant.Constants;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using IntuneAssistant.Models.Apps;
using IntuneAssistant.Models.Intents;
using Microsoft.Graph.Beta.Models.ODataErrors;
using Newtonsoft.Json;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class IntentsService : IIntentsService
{
    private readonly HttpClient _http = new();

    public async Task<List<IntentsModel>?> GetDiskEncryptionPoliciesListAsync(string? accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<IntentsModel>();
        try
        {
            var nextUrl = GraphUrls.DiskEncryptionPoliciesUrl;
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
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<IntentsModel>>(content);
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

    public async Task<List<IntentsModel>?> GetAllIntentsListAsync(string? accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<IntentsModel>();
        try
        {
            var nextUrl = GraphUrls.IntentsProfilesUrl;
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
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<IntentsModel>>(content);
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

    public async Task<List<IntentsModel>?> GetSecurityProfilesIntentsListAsync(string? accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<IntentsModel>();
        try
        {
            var nextUrl = GraphUrls.SecurityBaselineIntentsUrl;
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
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<IntentsModel>>(content);
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

    public async Task<List<IntentsModel>?> GetWindowsHelloIntentsListAsync(string? accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<IntentsModel>();
        try
        {
            var nextUrl = GraphUrls.WindowsHelloIntentsUrl;
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
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<IntentsModel>>(content);
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