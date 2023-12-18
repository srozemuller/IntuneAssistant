using System.Text;
using IntuneAssistant.Constants;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Newtonsoft.Json;
using Spectre.Console;

namespace IntuneAssistant.Infrastructure.Services;

public class AutopilotService : IDeploymentProfilesService
{
    private readonly HttpClient _http = new();
    public async Task<List<AutoPilotDeploymentProfileModel>?> GetAutoPilotDeploymentProfilesListAsync(string accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<AutoPilotDeploymentProfileModel>();
        var nextUrl = GraphUrls.WindowsAutopilotDeploymentProfiles;
        try
        {
            while (nextUrl is not null)
            {
                var response = await _http.GetAsync(nextUrl);
                if (response.IsSuccessStatusCode)
                {
                    var responseStream = await response.Content.ReadAsStreamAsync();
                    using var sr = new StreamReader(responseStream);
                    // Read the stream to a string
                    var content = await sr.ReadToEndAsync();

                    // Deserialize the string to your model
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<AutoPilotDeploymentProfileModel>>(content);
                    if (result?.Value is null)
                    {
                        nextUrl = null;
                        continue;
                    }
                    results.AddRange(result.Value);
                    nextUrl = result.ODataNextLink;
                }
                else
                {
                    AnsiConsole.WriteLine(
                        $"[red]Request failed: {response.StatusCode}[/]");
                    var message = await response.Content.ReadAsStringAsync();
                    var jObject = Newtonsoft.Json.Linq.JObject.Parse(message);
                    var innerErrorMessage = jObject["error"]?["innerError"]?["message"]?.ToString();
                    AnsiConsole.WriteLine($"[red]Error message: {innerErrorMessage}[/]");
                }
            }
        }
        catch (HttpRequestException e)
        {
            AnsiConsole.WriteLine("\nException Caught!");
            AnsiConsole.WriteLine("Message :{0} ", e.Message);
            nextUrl = null;
        }
        catch (Exception e)
        {
            AnsiConsole.WriteLine("\nException Caught!");
            AnsiConsole.WriteLine("Message :{0} ", e.Message);
        }

        return results;
    }

    public async Task<List<AutoPilotDeploymentProfileModel>?> GetAutoPilotDeploymentProfileByNameAsync(string accessToken, string name)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<AutoPilotDeploymentProfileModel>();
        var nextUrl = $"{GraphUrls.WindowsAutopilotDeploymentProfiles}?$filter=displayName eq '{name}'";
        try
        {
            while (nextUrl is not null)
            {
                var response = await _http.GetAsync(nextUrl);
                if (response.IsSuccessStatusCode)
                {
                    var responseStream = await response.Content.ReadAsStreamAsync();
                    using var sr = new StreamReader(responseStream);
                    // Read the stream to a string
                    var content = await sr.ReadToEndAsync();

                    // Deserialize the string to your model
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<AutoPilotDeploymentProfileModel>>(content);
                    if (result?.Value is null)
                    {
                        nextUrl = null;
                        continue;
                    }
                    results.AddRange(result.Value);
                    nextUrl = result.ODataNextLink;
                }
                else
                {
                    AnsiConsole.WriteLine(
                        $"[red]Request failed: {response.StatusCode}[/]");
                    var message = await response.Content.ReadAsStringAsync();
                    var jObject = Newtonsoft.Json.Linq.JObject.Parse(message);
                    var innerErrorMessage = jObject["error"]?["innerError"]?["message"]?.ToString();
                    AnsiConsole.WriteLine($"[red]Error message: {innerErrorMessage}[/]");
                }
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
        return results;
    }

    public async Task<AutoPilotDeploymentProfileCountModel?> GetAutoPilotDeploymentProfileDeviceCountAsync(string accessToken, string profileId)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var result = new AutoPilotDeploymentProfileCountModel();
        var nextUrl = $"{GraphUrls.WindowsAutopilotDeploymentProfiles}/{profileId}/assignedDevices?$count=true";
        try
        {
           var response = await _http.GetAsync(nextUrl);
                if (response.IsSuccessStatusCode)
                {
                    var responseStream = await response.Content.ReadAsStreamAsync();
                    using var sr = new StreamReader(responseStream);
                    // Read the stream to a string
                    var content = await sr.ReadToEndAsync();

                    // Deserialize the string to your model
                    result = JsonConvert.DeserializeObject<AutoPilotDeploymentProfileCountModel>(content);
                }
                else
                {
                    AnsiConsole.WriteLine(
                        $"[red]Request failed: {response.StatusCode}[/]");
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
            nextUrl = null;
        }
        catch (Exception e)
        {
            AnsiConsole.WriteLine("\nException Caught!");
            AnsiConsole.WriteLine("Message :{0} ", e.Message);
        }
        return result;
    }

    public async Task<List<AutopilotDeviceProfile>?> GetAutoPilotDevicesByDeploymentProfileNameListAsync(string accessToken, string profileId)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<AutopilotDeviceProfile>();
        var nextUrl = $"{GraphUrls.WindowsAutopilotDeploymentProfiles}('{profileId}')/assignedDevices?";
        try
        {
            while (nextUrl is not null)
            {
                var response = await _http.GetAsync(nextUrl);
                if (response.IsSuccessStatusCode)
                {
                    var responseStream = await response.Content.ReadAsStreamAsync();
                    using var sr = new StreamReader(responseStream);
                    // Read the stream to a string
                    var content = await sr.ReadToEndAsync();

                    // Deserialize the string to your model
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<AutopilotDeviceProfile>>(content);
                    if (result?.Value is null)
                    {
                        nextUrl = null;
                        continue;
                    }
                    results.AddRange(result.Value);
                    nextUrl = result.ODataNextLink;
                }
                else
                {
                    nextUrl = null;
                    AnsiConsole.WriteLine(
                        $"[red]Request failed: {response.StatusCode}[/]");
                    var message = await response.Content.ReadAsStringAsync();
                    var jObject = Newtonsoft.Json.Linq.JObject.Parse(message);
                    var innerErrorMessage = jObject["error"]?["innerError"]?["message"]?.ToString();
                    AnsiConsole.WriteLine($"[red]Error message: {innerErrorMessage}[/]");
                }
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
        return results;
    }
}