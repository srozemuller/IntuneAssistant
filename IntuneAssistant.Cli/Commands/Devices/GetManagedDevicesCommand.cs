using System.CommandLine;
using IntuneAssistant.Infrastructure;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Devices;

public class GetManagedDevicesCommand : Command<FetchManagedDevicesCommandOptions, FetchManagedDevicesCommandHandler>
{
    public GetManagedDevicesCommand() : base(CommandConfiguration.DevicesCommandName, CommandConfiguration.DevicesCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<bool>(CommandConfiguration.DevicesWindowsFilterName, CommandConfiguration.DevicesWindowsFilterDescription));
    }
}

public class FetchManagedDevicesCommandOptions : ICommandOptions
{
    public bool NonCompliant { get; set; } = false;
    
}

public class FetchManagedDevicesCommandHandler : ICommandOptionsHandler<FetchManagedDevicesCommandOptions>
{
    private readonly IDeviceService _deviceService;
    private readonly IIdentityHelperService _identityHelperService;

    public FetchManagedDevicesCommandHandler(IDeviceService deviceService, IIdentityHelperService identityHelperService)
    {
        _deviceService = deviceService;
        _identityHelperService = identityHelperService;
    }

    public async Task<int> HandleAsync(FetchManagedDevicesCommandOptions options)
    {

        var nonCompliantProvided = options.NonCompliant;
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();

        var devices = new List<DeviceModel?>();
        // Show progress spinner while fetching data
        await AnsiConsole.Status()
            .StartAsync("Fetching devices from Intune", async _ =>
            {
                if (nonCompliantProvided)
                {
                    var results = await _deviceService.GetNonCompliantManagedDevicesListAsync(accessToken);
                    if (results is not null)
                    {
                        devices.AddRange(results.Select(x => x.ToDeviceModel()));
                    }
                }
                else
                {
                    var allDeviceResults = await _deviceService.GetManagedDevicesListAsync(accessToken);
                    if (allDeviceResults is not null)
                    {
                        devices.AddRange(allDeviceResults.Select(x => x.ToDeviceModel()));
                    }
                }

            });
        var table = new Table();
        table.Collapse();
        table.AddColumn("Id");
        table.AddColumn("DeviceName");
        table.AddColumn("Status");
        table.AddColumn("LastSyncDateTime");

        foreach (var device in devices.Where(device => device is not null))
            table.AddRow(
                device.Id.ToString(),
                device.DeviceName,
                device.Status,
                device.LastSyncDateTime.ToString()
            );
        AnsiConsole.Write(table);
        return 0;
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
