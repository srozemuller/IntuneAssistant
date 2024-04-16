using System.Formats.Asn1;
using IntuneAssistant.Constants;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using IntuneAssistant.Models.Apps;
using IntuneAssistant.Models.Assignments;
using Microsoft.Graph.Beta.Models.ODataErrors;
using Newtonsoft.Json;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class AppsService : IAppsService
{
    private readonly HttpClient _http = new();

    public async Task<List<WindowsLobAppModel>?> GetWindowsLobAppsListAsync(string? accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<WindowsLobAppModel>();

        try
        {
            var nextUrl =
                $"{GraphUrls.MobileAppsUrl}?$filter=(isof(%27microsoft.graph.windowsStoreApp%27)%20or%20isof(%27microsoft.graph.microsoftStoreForBusinessApp%27)%20or%20isof(%27microsoft.graph.officeSuiteApp%27)%20or%20(isof(%27microsoft.graph.win32LobApp%27)%20and%20not(isof(%27microsoft.graph.win32CatalogApp%27)))%20or%20isof(%27microsoft.graph.windowsMicrosoftEdgeApp%27)%20or%20isof(%27microsoft.graph.windowsPhone81AppX%27)%20or%20isof(%27microsoft.graph.windowsPhone81StoreApp%27)%20or%20isof(%27microsoft.graph.windowsPhoneXAP%27)%20or%20isof(%27microsoft.graph.windowsAppX%27)%20or%20isof(%27microsoft.graph.windowsMobileMSI%27)%20or%20isof(%27microsoft.graph.windowsUniversalAppX%27)%20or%20isof(%27microsoft.graph.webApp%27)%20or%20isof(%27microsoft.graph.windowsWebApp%27)%20or%20isof(%27microsoft.graph.winGetApp%27))%20and%20(microsoft.graph.managedApp/appAvailability%20eq%20null%20or%20microsoft.graph.managedApp/appAvailability%20eq%20%27lineOfBusiness%27)&$orderby=displayName";
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
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<WindowsLobAppModel>>(content);
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

    public async Task<WindowsLobAppModel> GetAppByIdAsync(string accessToken, string applicationId)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var result = new WindowsLobAppModel();

        try
        {
            var nextUrl = $"{GraphUrls.MobileAppsUrl}/{applicationId}";
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
                    result = JsonConvert.DeserializeObject<WindowsLobAppModel>(content);
                    if (result is null)
                    {
                        nextUrl = null;
                    }
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

        return result;
    }

    public async Task<List<DefaultMobileAppModel>?> GetMobileAppsListAsync(string accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<DefaultMobileAppModel>();

        try
        {
            var nextUrl = $"{GraphUrls.MobileAppsUrl}";
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
                        JsonConvert.DeserializeObject<GraphValueResponse<DefaultMobileAppModel>>(content);
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

    public async Task<List<ManagedAppConfigurationModel>?> GetTargetedManagedAppConfigurationsListAsync(string accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<ManagedAppConfigurationModel>();

        try
        {
            var nextUrl = $"{GraphUrls.TargetedManagedAppConfigurationsUrl}";
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
                        JsonConvert.DeserializeObject<GraphValueResponse<ManagedAppConfigurationModel>>(content);
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

    public async Task<WindowsLobAppModel?> GetAppByNameAsync(string accessToken, string applicationName)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var result = new WindowsLobAppModel();

        try
        {
            var nextUrl = $"{GraphUrls.MobileAppsUrl}?$filter=displayname eq '{applicationName}'";
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
                    result = JsonConvert.DeserializeObject<WindowsLobAppModel>(content);
                    if (result is null)
                    {
                        nextUrl = null;
                    }
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

        return result;
    }

    public async Task<List<ResourceAssignmentsModel>?> GetIosLobAppProvisioningAssignmentsListAsync(string accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<ResourceAssignmentsModel>();

        try
        {
            var nextUrl = $"{GraphUrls.IosLobAppProvisioningUrl}";
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

    public async Task<List<MobileAppDependencyModel>?> GetAppDependenciesListAsync(string? accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var applications = new List<WindowsLobAppModel>();
        var dependencyResults = new List<MobileAppDependencyModel>();
        try
        {
            var nextUrl =
                $"{GraphUrls.MobileAppsUrl}?$filter=(isof(%27microsoft.graph.windowsStoreApp%27)%20or%20isof(%27microsoft.graph.microsoftStoreForBusinessApp%27)%20or%20isof(%27microsoft.graph.officeSuiteApp%27)%20or%20(isof(%27microsoft.graph.win32LobApp%27)%20and%20not(isof(%27microsoft.graph.win32CatalogApp%27)))%20or%20isof(%27microsoft.graph.windowsMicrosoftEdgeApp%27)%20or%20isof(%27microsoft.graph.windowsPhone81AppX%27)%20or%20isof(%27microsoft.graph.windowsPhone81StoreApp%27)%20or%20isof(%27microsoft.graph.windowsPhoneXAP%27)%20or%20isof(%27microsoft.graph.windowsAppX%27)%20or%20isof(%27microsoft.graph.windowsMobileMSI%27)%20or%20isof(%27microsoft.graph.windowsUniversalAppX%27)%20or%20isof(%27microsoft.graph.webApp%27)%20or%20isof(%27microsoft.graph.windowsWebApp%27)%20or%20isof(%27microsoft.graph.winGetApp%27))%20and%20(microsoft.graph.managedApp/appAvailability%20eq%20null%20or%20microsoft.graph.managedApp/appAvailability%20eq%20%27lineOfBusiness%27)&$orderby=displayName";
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
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<WindowsLobAppModel>>(content);
                    if (result?.Value is null)
                    {
                        nextUrl = null;
                        continue;
                    }

                    applications.AddRange(result.Value);
                    nextUrl = result.ODataNextLink;
                }
                catch (HttpRequestException e)
                {
                    nextUrl = null;
                }
            }

            foreach (var application in applications)
            {
                try
                {
                    var response =
                        await _http.GetAsync(
                            $"{GraphUrls.MobileAppsUrl}/{application.Id}/relationships?$filter=(isof(%27microsoft.graph.mobileAppDependency%27))");
                    var responseStream = await response.Content.ReadAsStreamAsync();

                    using var sr = new StreamReader(responseStream);
                    // Read the stream to a string
                    var content = await sr.ReadToEndAsync();
                    // Deserialize the string to your model
                    var dependencies =
                        JsonConvert.DeserializeObject<GraphValueResponse<MobileAppDependencyResponseModel>>(content);
                    if (dependencies?.Value is null)
                    {
                        nextUrl = null;
                        continue;
                    }

                    foreach (var dependency in dependencies.Value)
                    {
                        dependencyResults.Add(dependency.ToDependencyModel(application));
                    }
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

        return dependencyResults;
    }

    public async Task<List<MobileAppDependencyModel>?> GetAppDependenciesByAppNameAsync(string accessToken,
        string applicationDisplayName)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var applications = new List<WindowsLobAppModel>();
        var dependencyResults = new List<MobileAppDependencyModel>();
        try
        {
            var nextUrl =
                $"{GraphUrls.MobileAppsUrl}?$filter=((displayName eq '{applicationDisplayName}') and (isof(%27microsoft.graph.windowsStoreApp%27)%20or%20isof(%27microsoft.graph.microsoftStoreForBusinessApp%27)%20or%20isof(%27microsoft.graph.officeSuiteApp%27)%20or%20(isof(%27microsoft.graph.win32LobApp%27)%20and%20not(isof(%27microsoft.graph.win32CatalogApp%27)))%20or%20isof(%27microsoft.graph.windowsMicrosoftEdgeApp%27)%20or%20isof(%27microsoft.graph.windowsPhone81AppX%27)%20or%20isof(%27microsoft.graph.windowsPhone81StoreApp%27)%20or%20isof(%27microsoft.graph.windowsPhoneXAP%27)%20or%20isof(%27microsoft.graph.windowsAppX%27)%20or%20isof(%27microsoft.graph.windowsMobileMSI%27)%20or%20isof(%27microsoft.graph.windowsUniversalAppX%27)%20or%20isof(%27microsoft.graph.webApp%27)%20or%20isof(%27microsoft.graph.windowsWebApp%27)%20or%20isof(%27microsoft.graph.winGetApp%27))%20and%20(microsoft.graph.managedApp/appAvailability%20eq%20null%20or%20microsoft.graph.managedApp/appAvailability%20eq%20%27lineOfBusiness%27))";
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
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<WindowsLobAppModel>>(content);
                    if (result?.Value is null)
                    {
                        nextUrl = null;
                        continue;
                    }

                    var application = result.Value.Select(a => a).FirstOrDefault();
                    if (application is null)
                    {
                        return null;
                    }

                    var dependenciesResponse =
                        await _http.GetAsync(
                            $"{GraphUrls.MobileAppsUrl}/{application.Id}/relationships?$filter=(isof(%27microsoft.graph.mobileAppDependency%27))");
                    var dependenciesResponseStream = await dependenciesResponse.Content.ReadAsStreamAsync();

                    using var dependenciesString = new StreamReader(dependenciesResponseStream);
                    // Read the stream to a string
                    var dependenciesContent = await dependenciesString.ReadToEndAsync();
                    // Deserialize the string to your model
                    var dependencies =
                        JsonConvert.DeserializeObject<GraphValueResponse<MobileAppDependencyResponseModel>>(
                            dependenciesContent);
                    if (dependencies?.Value is null)
                    {
                        nextUrl = null;
                        continue;
                    }

                    foreach (var dependency in dependencies.Value)
                    {
                        dependencyResults.Add(dependency.ToDependencyModel(application));
                    }
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

        return dependencyResults;
    }

    public async Task<List<WindowsManagedAppProtectionsModel>?> GetWindowsManagedAppProtectionsListAsync(
        string accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<WindowsManagedAppProtectionsModel>();

        try
        {
            var nextUrl = $"{GraphUrls.WindowsManagedAppProtectionsUrl}";
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
                        JsonConvert.DeserializeObject<GraphValueResponse<WindowsManagedAppProtectionsModel>>(content);
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

    public async Task<List<IosAppProtectionModel>?> GetIosAppProtectionsListAsync(string accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<IosAppProtectionModel>();

        try
        {
            var nextUrl = $"{GraphUrls.IosManagedAppProtectionsUrl}";
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
                        JsonConvert.DeserializeObject<GraphValueResponse<IosAppProtectionModel>>(content);
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

    public async Task<List<AndroidAppProtectionModel>?> GetAndroidAppProtectionsListAsync(string accessToken)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<AndroidAppProtectionModel>();

        try
        {
            var nextUrl = $"{GraphUrls.AndroidManagedAppProtectionsUrl}";
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
                        JsonConvert.DeserializeObject<GraphValueResponse<AndroidAppProtectionModel>>(content);
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