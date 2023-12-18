using System.CommandLine;
using System.Globalization;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Services;
using IntuneAssistant.Models;
using Microsoft.IdentityModel.Tokens;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.AutoPilot.DeploymentProfiles;

public class DeviceDeploymentProfilesListCmd : Command<FetchDeviceDeploymentProfilesCommandOptions,FetchDeviceDeploymentProfilesCommandHandler>
{
    public DeviceDeploymentProfilesListCmd() : base(CommandConfiguration.ListCommandName, CommandConfiguration.ListCommandDescription)
    {
        AddOption(new Option<bool>(CommandConfiguration.RemoveArg, CommandConfiguration.RemoveArgDescription));
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
    }
}
public class FetchDeviceDeploymentProfilesCommandOptions : ICommandOptions
{
    public bool Remove { get; set; } = false;
    public string ExportCsv { get; set; } = String.Empty;

}

public class FetchDeviceDeploymentProfilesCommandHandler : ICommandOptionsHandler<FetchDeviceDeploymentProfilesCommandOptions>
{
    private readonly IDeploymentProfilesService _deploymentProfilesService;

    public FetchDeviceDeploymentProfilesCommandHandler(IDeploymentProfilesService deviceDeploymentProfilesService)
    {
        _deploymentProfilesService = deviceDeploymentProfilesService;
    }

    public async Task<int> HandleAsync(FetchDeviceDeploymentProfilesCommandOptions options)
    {
        var accessToken = await new IdentityHelperService().GetAccessTokenSilentOrInteractiveAsync();
        var exportCsvProvided = !options.ExportCsv.IsNullOrEmpty();
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }
        // Microsoft Graph
        // Implementation of shared service from infrastructure comes here
        var deploymentProfiles = new List<AutoPilotDeploymentProfileModel?>();
       
        // Show progress spinner while fetching data
        await AnsiConsole.Status()
            .StartAsync("Fetching deployment profiles from from Intune", async _ =>
            {
                var allDeploymentProfilesResults =
                    await _deploymentProfilesService.GetAutoPilotDeploymentProfilesListAsync(accessToken);
                    if (allDeploymentProfilesResults is not null)
                    {
                        deploymentProfiles.AddRange(allDeploymentProfilesResults);
                    }
            });
        if (deploymentProfiles.Count == 0)
        {
            AnsiConsole.MarkupLine("No deployment profiles matched the specified filter");
            return 0;
        }
        var table = new Table();
        table.Collapse();
        table.AddColumn("Id");
        table.AddColumn("Display Name");
        table.AddColumn("Description");
        table.AddColumn("Language");
        table.AddColumn("Device Type");
        table.AddColumn("DeviceName Template");
        table.AddColumn("Last Modified Date");
        table.AddColumn("DeviceCount");

        foreach (var profile in deploymentProfiles.Where(p => p is not null))
        {
            var count = await _deploymentProfilesService.GetAutoPilotDeploymentProfileDeviceCountAsync(accessToken,
                profile.Id);

            table.AddRow(
                profile.Id,
                profile.DisplayName,
                profile.Description,
                profile.Language,
                profile.DeviceNameTemplate,
                profile.DeviceType,
                profile.LastModifiedDateTime.ToString(CultureInfo.InvariantCulture),
                count?.OdataCount.ToString() ?? "0"
            );
        }

        AnsiConsole.Write(table);
        return 0;
    }
}
