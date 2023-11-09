using System.CommandLine;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Services;
using IntuneAssistant.Models;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands;

public class DeviceDuplicateCommand : Command<FetchDeviceDuplicateCommandOptions,FetchDeviceDuplicateCommandHandler>
{
    public DeviceDuplicateCommand() : base("duplicates", "Fetches duplicate devices from Intune")
    {
        AddOption(new Option<bool>(Constants.RemoveArg, Constants.RemoveArgDescription));
        AddOption(new Option<string>(Constants.ExportCsvArg, Constants.ExportCsvArgDescription));
    }
}
public class FetchDeviceDuplicateCommandOptions : ICommandOptions
{
    public bool Remove { get; set; } = false;
    public string ExportCsv { get; set; } = String.Empty;
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
        var exportCsv = !string.IsNullOrWhiteSpace(options.ExportCsv);
        var accessToken = await new IdentityHelperService().GetAccessTokenSilentOrInteractiveAsync();
        // Microsoft Graph
        // Implementation of shared service from infrastructure comes here
        var devices = new List<DeviceModel?>();
        // Show progress spinner while fetching data
        await AnsiConsole.Status()
            .StartAsync("Fetching duplicate devices from Intune", async _ =>
            {
                if (removeProvided)
                {
                    var duplicates = await _deviceDuplicateService.RemoveDuplicateDevicesAsync(accessToken);
                    if (duplicates is not null)
                    {
                        Console.WriteLine("Got results from duplicates");
                        devices.AddRange(duplicates.Select(x => x.ToDeviceModel()));
                    }
                }
                else
                {
                    var allDeviceResults = await _deviceDuplicateService.GetDuplicateDevicesListAsync(accessToken);
                    if (allDeviceResults is not null)
                    {
                        Console.WriteLine("Got results from duplicates");
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
