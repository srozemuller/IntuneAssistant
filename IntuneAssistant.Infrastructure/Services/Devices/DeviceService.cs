using System.Text;
using IntuneAssistant.Constants;
using IntuneAssistant.Extensions;
using IntuneAssistant.Helpers;
using IntuneAssistant.Infrastructure.Interfaces.Devices;
using IntuneAssistant.Infrastructure.Interfaces.Logging;
using IntuneAssistant.Models;
using IntuneAssistant.Models.Devices;
using IntuneAssistant.Models.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using Microsoft.Graph.Beta.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;
using Newtonsoft.Json;

namespace IntuneAssistant.Infrastructure.Services.Devices;

public sealed class DeviceService : IDeviceService

{
    private readonly HttpClient _http = new();
    private readonly ILogger<DeviceService> _logger;
    private readonly IApplicationInsightsService _applicationInsightsService;

    public DeviceService(ILogger<DeviceService> logger,
        IApplicationInsightsService applicationInsightsService)
    {
        _logger = logger;
        _applicationInsightsService = applicationInsightsService;
    }
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
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<ManagedDevice>>(content);
                    if (result is null)
                    {
                        nextUrl = null;
                        continue;
                    }

                    if (result.Value != null) results.AddRange(result.Value.Select(device => device.ToDeviceModel()!));
                    nextUrl = result.ODataNextLink;
                }
                catch (HttpRequestException e)
                {
                    Console.WriteLine("An exception has occurred while fetching configuration policies: " + e.ToMessage());
                    nextUrl = null;
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
    public async Task<List<ManagedDevice>?> GetDuplicateDevicesListAsync(string? accessToken, DeviceFilterOptions? filterOptions, ExportOptions? exportOptions)
    {
        try
        {
            filterOptions ??= new DeviceFilterOptions();

            var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
            var sb = new StringBuilder();
            if (filterOptions.IncludeWindows)
            {
                sb.Append("operatingSystem eq 'Windows'");
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
                if (sb.Length > 0)
                    sb.Append(" and ");
                sb.Append("complianceState eq 'nonCompliant'");
            }
            var odataFilter = sb.ToString();
            var filter = string.IsNullOrWhiteSpace(odataFilter) ? null : odataFilter;
            var results = new List<ManagedDevice>();
            try
            {
                var result = await graphClient.DeviceManagement.ManagedDevices.GetAsync(requestConfiguration =>
                {
                    requestConfiguration.QueryParameters.Filter = filter;
                });

                var duplicateDevices = result?.Value?.Where(t => t.Model != "Virtual Machine").GroupBy(d => d.SerialNumber)
                    .Where(g => g.Count() > 1)
                    .SelectMany(g => g)
                    .ToList();
                var duplicateVirtualDevices = result?.Value?.Where(t => t.Model == "Virtual Machine").GroupBy(d => d.DeviceName)
                    .Where(g => g.Count() > 1)
                    .SelectMany(g => g)
                    .ToList();
                if (duplicateDevices != null)
                    results.AddRange(duplicateDevices);
                if (duplicateVirtualDevices != null)
                    results.AddRange(duplicateVirtualDevices);
                if (exportOptions.ExportCsv.Length > 0)
                {
                    ExportData.ExportCsv(results, exportOptions.ExportCsv);
                }
                return results;
            }
            catch (ODataError ex)
            {
                Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
                return null;
            }

        }
        catch (ODataError odataError)
        {
            Console.WriteLine(odataError.ToMessage());
            throw;
        }
    }

    
    public async Task<List<ManagedDevice>?> RemoveDuplicateDevicesAsync(string? accessToken)
    {
        try
        {
            // Create a new instance of GraphServiceClient with the DeviceCodeCredential and scopes
            var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
            var result = await graphClient.DeviceManagement.ManagedDevices.GetAsync();
            var devices = result?.Value?.Where(dm => dm.Model != "Virtual Machine").GroupBy(d => d.SerialNumber)
                    .Where(g => g.Count() > 1)
                    .SelectMany(g => g.OrderBy(i => i.LastSyncDateTime).Take(g.Count() - 1))
                    .ToList();
            
                foreach (var device in devices)
                {
                    await graphClient.DeviceManagement.ManagedDevices[$"{device.Id}"].DeleteAsync();
                }
                _logger.LogWarning($"Removing physical devices, storing list in {AppConfiguration.DEFAULT_EXPORTFILENAME} ");
                ExportData.ExportCsv(devices,AppConfiguration.DEFAULT_EXPORTFILENAME);
                return devices;
        }
        catch (ServiceException e)
        {
            _logger.LogError($"Got error {e.ResponseStatusCode}, {e.Message}");
        }
        return null;
    }
}
