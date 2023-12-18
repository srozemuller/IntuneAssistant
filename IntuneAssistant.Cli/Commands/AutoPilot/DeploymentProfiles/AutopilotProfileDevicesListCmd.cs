using System.CommandLine;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Services;
using IntuneAssistant.Models;
using Microsoft.IdentityModel.Tokens;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.AutoPilot.DeploymentProfiles;

public class AutopilotProfileDevicesListCmd : Command<FetchAutopilotDevicesCommandOptions,FetchAutopilotDevicesCommandHandler>
{
    public AutopilotProfileDevicesListCmd() : base(CommandConfiguration.ListCommandName, CommandConfiguration.ListCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<string>(CommandConfiguration.NameArg, CommandConfiguration.NameArgDescription));
    }
}
public class FetchAutopilotDevicesCommandOptions : ICommandOptions
{
    public string Name { get; set; } = String.Empty;
    public string ExportCsv { get; set; } = String.Empty;
}

public class FetchAutopilotDevicesCommandHandler : ICommandOptionsHandler<FetchAutopilotDevicesCommandOptions>
{
    private readonly IDeploymentProfilesService _deploymentProfilesService;

    public FetchAutopilotDevicesCommandHandler(IDeploymentProfilesService deviceDeploymentProfilesService)
    {
        _deploymentProfilesService = deviceDeploymentProfilesService;
    }

    public async Task<int> HandleAsync(FetchAutopilotDevicesCommandOptions options)
    {
        var name = options.Name;
        var accessToken = await new IdentityHelperService().GetAccessTokenSilentOrInteractiveAsync();
        var exportToCsvProvided = !options.ExportCsv.IsNullOrEmpty();
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }
        var deploymentProfileDevices = new List<AutopilotDeviceProfile?>();
        if (!name.IsNullOrEmpty())
        {
            // Show progress spinner while fetching data
            await AnsiConsole.Status()
                .StartAsync($"Fetching devices based on deployment profile {name} from from Intune", async _ =>
                {
                    var deploymentProfile =
                        await _deploymentProfilesService.GetAutoPilotDeploymentProfileByNameAsync(accessToken, name);
                    if (deploymentProfile?.FirstOrDefault() is not null)
                    {
                        var allAutopilotDevices =
                            await _deploymentProfilesService.GetAutoPilotDevicesByDeploymentProfileNameListAsync(
                                accessToken, deploymentProfile.FirstOrDefault()?.Id);
                        if (allAutopilotDevices is not null)
                        {
                            deploymentProfileDevices.AddRange(allAutopilotDevices);
                        }
                    }
                });
        }

        if (deploymentProfileDevices.Count == 0)
        {
            AnsiConsole.MarkupLine("No devices found in deployment profiles matched the specified filter, did you fill in the profile name correctly?");
            return 0;
        }
        if (exportToCsvProvided)
        {
            ExportData.ExportCsv(deploymentProfileDevices, options.ExportCsv);
            return 0;
        }
        var table = new Table();
        table.Collapse();
        
        table.AddColumn("Id");
        table.AddColumn("Display Name");
        table.AddColumn("Serial Number");
        table.AddColumn("Model");
        table.AddColumn("Manufacturer");
        table.AddColumn("Group Tag");
        table.AddColumn("Profile Assignment state");
        table.AddColumn("Profile Name");

        foreach (var device in deploymentProfileDevices.Where(p => p is not null))
        {
                table.AddRow(
                device.Id,
                device.DisplayName,
                device.SerialNumber,
                device.Model,
                device.Manufacturer,
                device.GroupTag,
                device.DeploymentProfileAssignmentStatus,
                name
                );
        }

        if (exportToCsvProvided)
        {
            ExportData.ExportCsv(deploymentProfileDevices,options.ExportCsv);
        }
        AnsiConsole.Write(table);
        return 0;
    }
}
