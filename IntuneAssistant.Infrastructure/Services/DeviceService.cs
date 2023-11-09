using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.Graph;
using Microsoft.Graph.Beta.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class DeviceService : IDeviceService
{
    public async Task<List<ManagedDevice>?> GetManagedDevicesListAsync(string accessToken)
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
           // Console.WriteLine(odataError.Error?.Message);
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
    public async Task<List<ManagedDevice>?> GetFilteredDevices(string accessToken)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var result = await graphClient.DeviceManagement.ManagedDevices.GetAsync((r) => {
            r.QueryParameters.Filter = "operatingSystem eq 'windows'";
        });
        return result?.Value;
    }
}
