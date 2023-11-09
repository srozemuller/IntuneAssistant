using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using Microsoft.Graph.Beta.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;

namespace IntuneAssistant.Infrastructure.Services;

public class DeviceDuplicateServices : IDeviceDuplicateService
{
    private string _accessToken = string.Empty;
    private readonly ILogger<DeviceDuplicateServices> _logger;
    public DeviceDuplicateServices(ILogger<DeviceDuplicateServices> logger)
    {
        _accessToken = Environment.GetEnvironmentVariable("ACCESS_TOKEN") ?? throw new Exception("No token provided");
        _logger = _logger;
    }

    public async Task<List<ManagedDevice>?> GetDuplicateDevicesListAsync()
    {
        try
        {
            // Create a new instance of GraphServiceClient with the DeviceCodeCredential and scopes
            var graphClient = new GraphClient(_accessToken).GetAuthenticatedGraphClient();
            var result = await graphClient.DeviceManagement.ManagedDevices.GetAsync();
            var duplicateDevices = result?.Value?.GroupBy(d => d.DeviceName)
                    .Where(g => g.Count() > 1)
                    .SelectMany(g => g)
                    .ToList();
            return duplicateDevices;
        }
        catch (ODataError odataError)
        {
            Console.WriteLine(odataError.ToMessage());
            throw;
        }
    }
    public async Task<List<ManagedDevice>?> RemoveDuplicateDevicesAsync()
    {
        try
        {
            // Create a new instance of GraphServiceClient with the DeviceCodeCredential and scopes
            var graphClient = new GraphClient(_accessToken).GetAuthenticatedGraphClient();
            var result = await graphClient.DeviceManagement.ManagedDevices.GetAsync();

            var devices = result?.Value?.GroupBy(d => d.DeviceName)
                    .Where(g => g.Count() > 1)
                    .SelectMany(g => g.OrderBy(i => i.LastSyncDateTime).Take(g.Count() - 1))
                    .ToList();
                foreach (var device in devices)
                {
                    _logger.LogWarning("Found machines");
                    await graphClient.DeviceManagement.ManagedDevices[$"{device.Id}"].DeleteAsync();
                }
                return devices;

        }
        catch (ServiceException e)
        {
            _logger.LogError($"Got error {e.ResponseStatusCode}, {e.Message}");
        }
        return null;
    }
}
