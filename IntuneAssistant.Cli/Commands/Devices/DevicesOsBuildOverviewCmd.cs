using System.CommandLine;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Interfaces.Devices;
using IntuneAssistant.Models;
using IntuneAssistant.Models.Options;
using Microsoft.Graph.Beta.Models;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Devices;

public class DevicesOsBuildOverviewCmd : Command<FetchDevicesOsBuildOverviewCommandOptions, FetchDevicesOsBuildOverviewCommandHandler>
{
    public DevicesOsBuildOverviewCmd() : base(CommandConfiguration.DeviceOsBuildOverviewCommandName, CommandConfiguration.DeviceOsBuildOverviewCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<bool>(CommandConfiguration.DevicesWindowsFilterName, CommandConfiguration.DevicesWindowsFilterDescription));
        AddOption(new Option<bool>(CommandConfiguration.DevicesMacOsFilterName, CommandConfiguration.DevicesMacOsFilterDescription));
        AddOption(new Option<bool>(CommandConfiguration.DevicesIosFilterName, CommandConfiguration.DevicesIosFilterDescription));
        AddOption(new Option<bool>(CommandConfiguration.DevicesAndroidFilterName, CommandConfiguration.DevicesAndroidFilterDescription));
        AddOption(new Option<bool>(CommandConfiguration.DevicesNonCompliantFilterName, CommandConfiguration.DevicesNonCompliantFilterDescription));

    }
}

public class FetchDevicesOsBuildOverviewCommandOptions : ICommandOptions
{
    public bool IncludeWindows { get; set; } = false;
    public bool IncludeMacOs { get; set; } = false;
    public bool IncludeIos { get; set; } = false;
    public bool IncludeAndroid { get; set; } = false;
}

public class FetchDevicesOsBuildOverviewCommandHandler : ICommandOptionsHandler<FetchDevicesOsBuildOverviewCommandOptions>
{
    private readonly IDeviceService _deviceService;
    private readonly IIdentityHelperService _identityHelperService;

    public FetchDevicesOsBuildOverviewCommandHandler(IDeviceService deviceService, IIdentityHelperService identityHelperService)
    {
        _deviceService = deviceService;
        _identityHelperService = identityHelperService;
    }

    public async Task<int> HandleAsync(FetchDevicesOsBuildOverviewCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        if (string.IsNullOrWhiteSpace(accessToken))
        {
                AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
                return -1;
        }

        var table = new Table();
        table.Collapse();
        table.AddColumn("OS");
        table.AddColumn("Build");
        table.AddColumn("Total");

        var devices = new List<OsBuildModel>();
        var deviceFilterOptions = new DeviceFilterOptions
        {
            IncludeWindows = options.IncludeWindows,
            IncludeMacOs = options.IncludeMacOs,
            IncludeIos = options.IncludeIos,
            IncludeAndroid = options.IncludeAndroid,
        };

        // Show progress spinner while fetching data
        await AnsiConsole.Status()
            .StartAsync("Fetching devices from Intune", async _ =>
            {
                devices = await _deviceService.GetDevicesOsVersionsOverviewAsync(accessToken, deviceFilterOptions);
            });

        if (devices?.Count == 0)
        {
            AnsiConsole.MarkupLine("No devices matched the specified filter");
            return 0;
        }

        foreach (var device in devices)
        {
            table.AddRow(
                device.OS,
                device.OsVersion,
                device.Count.ToString()
                );
        }

        AnsiConsole.Write(table);
        return 0;
    }
}
