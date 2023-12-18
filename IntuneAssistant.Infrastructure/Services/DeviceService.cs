using System.Text;
using System.Text.Json;
using IntuneAssistant.Constants;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using IntuneAssistant.Models.Options;
using Microsoft.Graph;
using Microsoft.Graph.Beta.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;


namespace IntuneAssistant.Infrastructure.Services;

public sealed class DeviceService : IDeviceService
{
    private readonly HttpClient _http = new();
    public async Task<List<ManagedDevice>?> GetManagedDevicesListAsync(string accessToken, string? filter)
    {
        try
        {
            // Create a new instance of GraphServiceClient with the DeviceCodeCredential and scopes
            var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
            var result = await graphClient.DeviceManagement.ManagedDevices.GetAsync();
            return result?.Value;
        }
        catch (ServiceException e)
        {
            Console.WriteLine(e.Message);
            throw;
        }
    }

    public async Task<List<ManagedDevice>?> GetNonCompliantManagedDevicesListAsync(string accessToken)
    {
        try
        {
            var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
            var result = await graphClient.DeviceManagement.ManagedDevices.GetAsync();
            return result?.Value?.Where(device => device.ComplianceState is ComplianceState.Noncompliant).ToList();
        }
        catch (ODataError odataError)
        {
            Console.WriteLine(odataError.Error?.Code);
            Console.WriteLine(odataError.Error?.Message);
            throw;
        }
    }

    public async Task<List<ManagedDevice>?> GetFilteredDevicesListAsync(string accessToken, DeviceFilterOptions? filterOptions)
    {
        filterOptions ??= new DeviceFilterOptions();

        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var sb = new StringBuilder();

        if (filterOptions.IncludeWindows)
        {
            sb.Append("operatingSystem eq 'Windows'");

            if (filterOptions.SelectNonCompliant)
                sb.Append(" and complianceState eq 'NonCompliant'");
        }

        if (filterOptions.IncludeMacOs)
        {
            if (sb.Length > 0)
                sb.Append(" or ");

            sb.Append("operatingSystem eq 'macOS'");
        }

        if (filterOptions.IncludeIos)
        {
            if (sb.Length > 0)
                sb.Append(" or ");

            sb.Append("operatingSystem eq 'iOS'");
        }

        if (filterOptions.IncludeAndroid)
        {
            if (sb.Length > 0)
                sb.Append(" or ");

            sb.Append("operatingSystem eq 'Android'");
        }

        if (filterOptions.SelectNonCompliant)
        {
            sb.Append(" complianceState eq 'nonCompliant'");
        }
        var odataFilter = sb.ToString();
        var filter = string.IsNullOrWhiteSpace(odataFilter) ? null : odataFilter;

        var results = new List<ManagedDevice>();
        Console.WriteLine(filter);

        try
        {
            var result = await graphClient.DeviceManagement.ManagedDevices.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = filter;
            });

            if (result?.Value != null)
                results.AddRange(result.Value);
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
            return null;
        }

        return results;
    }
    public async Task<GraphValueResponse<OsBuildModel?>?> GetDevicesOsVersionsOverviewAsync(string accessToken,
        DeviceFilterOptions? filterOptions)
    {
        string url = GraphUrls.ManagedDevicesUrl;
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        
        filterOptions ??= new DeviceFilterOptions();
        var results = new List<OsBuildModel>();
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var sb = new StringBuilder();

        if (filterOptions.IncludeWindows)
        {
            sb.Append("operatingSystem eq 'Windows'");

            if (filterOptions.SelectNonCompliant)
                sb.Append(" and complianceState eq 'NonCompliant'");
        }

        if (filterOptions.IncludeMacOs)
        {
            if (sb.Length > 0)
                sb.Append(" or ");

            sb.Append("operatingSystem eq 'macOS'");
        }

        if (filterOptions.IncludeIos)
        {
            if (sb.Length > 0)
                sb.Append(" or ");

            sb.Append("operatingSystem eq 'iOS'");
        }

        if (filterOptions.IncludeAndroid)
        {
            if (sb.Length > 0)
                sb.Append(" or ");

            sb.Append("operatingSystem eq 'Android'");
        }

        if (filterOptions.SelectNonCompliant)
        {
            sb.Append(" complianceState eq 'nonCompliant'");
        }
        var odataFilter = sb.ToString();
        var filter = string.IsNullOrWhiteSpace(odataFilter) ? null : odataFilter;

        Console.WriteLine(filter);

        try
        {
            var response = await _http.GetAsync(url);
            var responseStream = await response.Content.ReadAsStreamAsync();
            var result = await JsonSerializer.DeserializeAsync<GraphValueResponse<OsBuildModel?>>(responseStream, CustomJsonOptions.Default());
            return result;
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
            return null;
        }
    }
}
