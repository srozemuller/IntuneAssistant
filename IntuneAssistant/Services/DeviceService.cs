using IntuneAssistant.Interfaces;
using IntuneAssistant.Helpers;
using Microsoft.Graph;
using Microsoft.Graph.Beta.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;
using Microsoft.Identity.Client;


namespace IntuneAssistant.Services;

public sealed class DeviceService : IDeviceService
{

    private string _accessToken = string.Empty;
    private readonly ILoginService _loginService;
    public DeviceService(ILoginService loginService)
    {
        _loginService = loginService;
        Init(); 
    }

    private void Init()
    {
        _accessToken = Environment.GetEnvironmentVariable("ACCESS_TOKEN") ?? throw new Exception("No token provided");
    }
    public async Task<List<ManagedDevice>?> GetManagedDevicesListAsync()
    {
        try
        {
            // Create a new instance of GraphServiceClient with the DeviceCodeCredential and scopes
            var graphClient = new GraphClient(_accessToken).GetAuthenticatedGraphClient();
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
    public async Task<List<ManagedDevice>?> GetNonCompliantManagedDevicesListAsync()
    {
        try 
        {
            var graphClient = new GraphClient(_accessToken).GetAuthenticatedGraphClient();
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
}
