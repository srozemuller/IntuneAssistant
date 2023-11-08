using System.CommandLine;
using IntuneAssistant.Extensions;
using IntuneAssistant.Interfaces;
using IntuneAssistant.Models;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands;

public class GetManagedDevicesCommand : Command<FetchManagedDevicesCommandOptions, FetchManagedDevicesCommandHandler>
{
    public GetManagedDevicesCommand() : base("devices", "Fetches devices from Intune")
    {
        AddOption(new Option<bool>("--non-compliant", "Shows all duplicate devices based on device name"));
        AddOption(new Option<string>("--export-csv", "Exports the list to a csv file"));
    }
}

public class FetchManagedDevicesCommandOptions : ICommandOptions
{
    public bool NonCompliant { get; set; } = false;
    public string ExportCsv { get; set; } = String.Empty;
}

public class FetchManagedDevicesCommandHandler : ICommandOptionsHandler<FetchManagedDevicesCommandOptions>
{
    private readonly IDeviceService _deviceService;

    public FetchManagedDevicesCommandHandler(IDeviceService deviceService)
    {
        _deviceService = deviceService;
    }
    
    public async Task<int> HandleAsync(FetchManagedDevicesCommandOptions options)
    {
        
        var nonCompliantProvided = options.NonCompliant;
        var exportCsv = !string.IsNullOrWhiteSpace(options.ExportCsv);
        // Microsoft Graph
        // Implementation of shared service from infrastructure comes here
        var devices = new List<DeviceModel?>();
        // Show progress spinner while fetching data
        await AnsiConsole.Status()
            .StartAsync("Fetching devices from Intune", async _ =>
            {
                if (nonCompliantProvided)
                {
                    var results = await _deviceService.GetNonCompliantManagedDevicesListAsync();
                    if (results is not null)
                    {
                        devices.AddRange(results.Select(x => x.ToDeviceModel()));
                    }
                }
                else
                {
                    var allDeviceResults = await _deviceService.GetManagedDevicesListAsync();
                    if (allDeviceResults is not null)
                    {
                        devices.AddRange(allDeviceResults.Select(x => x.ToDeviceModel()));
                    }
                }

            });
        if (exportCsv)
        {
            ExportData.ExportCsv(devices,options.ExportCsv);
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
        return 0;
    }
}
