using System.CommandLine;
using System.CommandLine.NamingConventionBinder;
using System.CommandLine.Parsing;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models.Options;
using Microsoft.Graph.Beta.Models;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Devices;

public class ManagedDevicesCmd : Command<FetchManagedDevicesCommandOptions, FetchManagedDevicesCommandHandler>
{
    public ManagedDevicesCmd() : base(CommandConfiguration.DevicesListCommandName, CommandConfiguration.DevicesListCommandDescription)
    {
        AddOption(new Option<bool>(CommandConfiguration.DevicesWindowsFilterName, CommandConfiguration.DevicesWindowsFilterDescription));
        AddOption(new Option<bool>(CommandConfiguration.DevicesMacOsFilterName, CommandConfiguration.DevicesMacOsFilterDescription));
        AddOption(new Option<bool>(CommandConfiguration.DevicesIosFilterName, CommandConfiguration.DevicesIosFilterDescription));
        AddOption(new Option<bool>(CommandConfiguration.DevicesAndroidFilterName, CommandConfiguration.DevicesAndroidFilterDescription));
        AddOption(new Option<bool>(CommandConfiguration.DevicesNonCompliantFilterName, CommandConfiguration.DevicesNonCompliantFilterDescription));
    }
    
}

public class FetchManagedDevicesCommandOptions : ICommandOptions
{
    public bool IncludeWindows { get; set; } = false;
    public bool IncludeMacOs { get; set; } = false;
    public bool IncludeIos { get; set; } = false;
    public bool IncludeAndroid { get; set; } = false;
    public bool SelectNonCompliant { get; set; } = false;
    public string Output { get; set; } = String.Empty;
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
        
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
       
        var devices = new List<ManagedDevice>();
        var deviceFilterOptions = new DeviceFilterOptions
        {
            IncludeWindows = options.IncludeWindows,
            IncludeMacOs = options.IncludeMacOs,
            IncludeIos = options.IncludeIos,
            IncludeAndroid = options.IncludeAndroid,
            SelectNonCompliant = options.SelectNonCompliant
        };

        // Show progress spinner while fetching data
        await AnsiConsole.Status()
            .StartAsync("Fetching devices from Intune", async _ =>
            {
                devices = await _deviceService.GetFilteredDevicesListAsync(accessToken, deviceFilterOptions);
            });

        if (devices?.Count == 0)
        {
            AnsiConsole.MarkupLine("No devices matched the specified filter");
            return 0;
        }

        if (Enum.TryParse(options.Output, true, out Enums.FixedOptions outputOption))
        {
            switch (outputOption)
            {
                case Enums.FixedOptions.table:
                {
                    var table = new Table();
                    table.Collapse();
                    table.AddColumn("Id");
                    table.AddColumn("DeviceName");
                    table.AddColumn("OS");
                    table.AddColumn("LastSyncDateTime");
                    foreach (var device in devices)
                    {
                        table.AddRow(
                            device.Id ?? string.Empty,
                            device.DeviceName ?? string.Empty,
                            device.OperatingSystem ?? string.Empty,
                            device.LastSyncDateTime.ToString() ?? string.Empty
                        );
                    }
                    AnsiConsole.Write(table);
                    return 0;
                }
            }
        }

        return 0;
    }
}
