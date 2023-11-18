using System.CommandLine;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Services;
using IntuneAssistant.Models;
using IntuneAssistant.Models.Options;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Devices;

public class DeviceDuplicateCmd : Command<FetchDeviceDuplicateCommandOptions,FetchDeviceDuplicateCommandHandler>
{
    public DeviceDuplicateCmd() : base(CommandConfiguration.DevicesDuplicatesCommandName, CommandConfiguration.DevicesDuplicatesCommandDescription)
    {
        AddOption(new Option<bool>(CommandConfiguration.RemoveArg, CommandConfiguration.RemoveArgDescription));
        AddOption(new Option<bool>(CommandConfiguration.ForceArg, CommandConfiguration.ForceArgDescription));
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<bool>(CommandConfiguration.DevicesWindowsFilterName, CommandConfiguration.DevicesWindowsFilterDescription));
        AddOption(new Option<bool>(CommandConfiguration.DevicesMacOsFilterName, CommandConfiguration.DevicesMacOsFilterDescription));
        AddOption(new Option<bool>(CommandConfiguration.DevicesIosFilterName, CommandConfiguration.DevicesIosFilterDescription));
        AddOption(new Option<bool>(CommandConfiguration.DevicesAndroidFilterName, CommandConfiguration.DevicesAndroidFilterDescription));
        AddOption(new Option<bool>(CommandConfiguration.DevicesNonCompliantFilterName, CommandConfiguration.DevicesNonCompliantFilterDescription));
    }
}
public class FetchDeviceDuplicateCommandOptions : ICommandOptions
{
    public bool Remove { get; set; } = false;
    public string ExportCsv { get; set; } = String.Empty;
    public bool IncludeWindows { get; set; } = false;
    public bool IncludeMacOs { get; set; } = false;
    public bool IncludeIos { get; set; } = false;
    public bool IncludeAndroid { get; set; } = false;
    public bool SelectNonCompliant { get; set; } = false;
    public bool Force { get; set; } = false;
}

public class FetchDeviceDuplicateCommandHandler : ICommandOptionsHandler<FetchDeviceDuplicateCommandOptions>
{
    private readonly IDeviceDuplicateService _deviceDuplicateService;

    public FetchDeviceDuplicateCommandHandler(IDeviceDuplicateService deviceDuplicateService)
    {
        _deviceDuplicateService = deviceDuplicateService;
    }

    public async Task<int> HandleAsync(FetchDeviceDuplicateCommandOptions options)
    {

        var removeProvided = options.Remove;
        var forceProviced = options.Force;
        var accessToken = await new IdentityHelperService().GetAccessTokenSilentOrInteractiveAsync();
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }
        // Microsoft Graph
        // Implementation of shared service from infrastructure comes here
        var devices = new List<DeviceModel?>();
        var deviceFilterOptions = new DeviceFilterOptions
        {
            IncludeWindows = options.IncludeWindows,
            IncludeMacOs = options.IncludeMacOs,
            IncludeIos = options.IncludeIos,
            IncludeAndroid = options.IncludeAndroid,
            SelectNonCompliant = options.SelectNonCompliant
        };
        var exportOptions = new ExportOptions
        {
            ExportCsv = options.ExportCsv
        };
        // Show progress spinner while fetching data
        await AnsiConsole.Status()
            .StartAsync("Fetching duplicate devices from Intune", async _ =>
            {

                    var allDeviceResults = await _deviceDuplicateService.GetDuplicateDevicesListAsync(accessToken, deviceFilterOptions, exportOptions);
                    if (allDeviceResults is not null)
                    {
                        devices.AddRange(allDeviceResults.Select(x => x.ToDeviceModel()));
                    }
            });
        if (devices?.Count == 0)
        {
            AnsiConsole.MarkupLine("No devices matched the specified filter");
            return 0;
        }
        var table = new Table();
        table.Collapse();
        table.AddColumn("Id");
        table.AddColumn("DeviceName");
        table.AddColumn("Status");
        table.AddColumn("LastSyncDateTime");
        table.AddColumn("OsVersion");

        foreach (var device in devices.Where(device => device is not null))
            table.AddRow(
                device.Id.ToString(),
                device.DeviceName,
                device.Status,
                device.LastSyncDateTime.ToString(),
                device.OsVersion
            );
        AnsiConsole.Write(table);
        if (removeProvided && forceProviced)
        {
            await _deviceDuplicateService.RemoveDuplicateDevicesAsync(accessToken);
        }

        if (removeProvided)
        {
            ConsoleKey input;
            do {
                AnsiConsole.MarkupLine("[red]Do you want to remove all duplicate devices above in Intune? (y/n)[/]");
                input = Console.ReadKey().Key;
                switch (input)
                {
                    case ConsoleKey.Y:
                        //do something
                        break;
                    case ConsoleKey.N:
                        //do something else
                        break;
                    default:
                        AnsiConsole.MarkupLine("[red]Invalid input. Please press y or n.[/]");
                        break;
                }
            } while (input != ConsoleKey.Y && input != ConsoleKey.N);
        }
        return 0;
    }
}
