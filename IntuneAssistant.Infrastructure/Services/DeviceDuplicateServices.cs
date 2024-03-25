using System.Text;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models.Options;
using IntuneAssistant.Constants;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using Microsoft.Graph.Beta.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;

namespace IntuneAssistant.Infrastructure.Services;

public class DeviceDuplicateServices : IDeviceDuplicateService
{

    private readonly ILogger<DeviceDuplicateServices> _logger;
    public DeviceDuplicateServices(ILogger<DeviceDuplicateServices> logger)
    {
        _logger = logger;
    }

    public async Task<List<ManagedDevice>?> GetDuplicateDevicesListAsync(string? accessToken, DeviceFilterOptions? filterOptions, ExportOptions? exportOptions  )
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
