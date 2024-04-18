using System.Text;
using IntuneAssistant.Constants;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using IntuneAssistant.Models.Devices;
using IntuneAssistant.Models.Options;
using Microsoft.Graph.Beta.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;
using Newtonsoft.Json;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class DeviceService : IDeviceService

{
    private readonly HttpClient _http = new();
    public async Task<List<DeviceModel>?> GetManagedDevicesListAsync(string? accessToken, string? filter)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<DeviceModel>();
        try
        {
            var nextUrl = GraphUrls.ManagedDevicesUrl;
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
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<DeviceModel>>(content);
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
                    Console.WriteLine("An exception has occurred while fetching configuration policies: " + e.ToMessage());
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

    public async Task<List<ManagedDevice>?> GetNonCompliantManagedDevicesListAsync(string? accessToken)
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

    public async Task<List<ManagedDevice>?> GetFilteredDevicesListAsync(string? accessToken, DeviceFilterOptions? filterOptions)
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
    public async Task<List<OsBuildModel>> GetDevicesOsVersionsOverviewAsync(string? accessToken, DeviceFilterOptions? filterOptions)
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

        Console.WriteLine(filter);

        try
        {
            var result = await graphClient.DeviceManagement.ManagedDevices.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = filter;
            });
    
            var groupedDevices = result.Value.GroupBy(d => new { d.OsVersion, d.OperatingSystem }).Select(g => new OsBuildModel()
            {
                OS = g.Key.OperatingSystem,
                OsVersion = g.Key.OsVersion,
                Count = g.Count()
            }).ToList();
            return groupedDevices;
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
            return null;
        }
    }
}
