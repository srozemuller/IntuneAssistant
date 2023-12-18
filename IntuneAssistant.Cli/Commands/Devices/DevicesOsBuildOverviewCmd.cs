using System.CommandLine;
using IntuneAssistant.Constants;
using IntuneAssistant.Enums;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using IntuneAssistant.Models.Options;
using Newtonsoft.Json;
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
    
    public string Output { get; set; } = String.Empty;
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

        if (string.IsNullOrEmpty(options.Output))
        {
            // If not, set it to the default value
            options.Output = AppConfiguration.DEFAULT_OUTPUT;
        }

        var devices = new GraphValueResponse<OsBuildModel?>();
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

        if (devices is null)
        {
            AnsiConsole.MarkupLine("No devices found!");
            return -1;
        }

        var groupedDevices = devices.Value?.GroupBy(d => new { d.OsVersion, d.OperatingSystem }).Select(g => new OsBuildModel()
        {
            OperatingSystem = g.Key.OperatingSystem,
            OsVersion = g.Key.OsVersion,
            Count = g.Count()
        }).ToList();

        if (!Enum.TryParse(options.Output, true, out FixedOptions outputOption)) return 0;
        switch (outputOption)
        {
            case FixedOptions.table:
            {
                var table = new Table();
                table.Collapse();
                table.AddColumn("OS");
                table.AddColumn("Build");
                table.AddColumn("Total");
                if (groupedDevices != null)
                    foreach (var device in groupedDevices)
                    {
                        table.AddRow(
                            device.OperatingSystem,
                            device.OsVersion,
                            device.Count.ToString()
                        );
                    }
                AnsiConsole.Write(table);
                break;
            }
            case FixedOptions.json:
            {
                string groupedDevicesString = JsonConvert.SerializeObject(groupedDevices);
                AnsiConsole.WriteLine(groupedDevicesString);
                break;
            }
        }
        return 0;
    }
}
