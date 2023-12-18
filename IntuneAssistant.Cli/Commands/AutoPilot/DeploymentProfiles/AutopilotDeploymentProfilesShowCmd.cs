using System.CommandLine;
using System.Globalization;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Services;
using IntuneAssistant.Models;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.AutoPilot.DeploymentProfiles;

public class DeviceDeploymentProfileShowCmd : Command<FetchDeviceDeploymentProfileShowCommandOptions,FetchDeviceDeploymentProfileShowCommandHandler>
{
    public DeviceDeploymentProfileShowCmd() : base(CommandConfiguration.ShowCommandName, CommandConfiguration.ShowCommandName)
    {
        AddOption(new Option<bool>(CommandConfiguration.RemoveArg, CommandConfiguration.RemoveArgDescription));
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<string>(CommandConfiguration.NameArg, CommandConfiguration.NameArgDescription));
    }
}
public class FetchDeviceDeploymentProfileShowCommandOptions : ICommandOptions
{
    public bool Remove { get; set; } = false;
    public string Name { get; set; } = String.Empty;
}

public class FetchDeviceDeploymentProfileShowCommandHandler : ICommandOptionsHandler<FetchDeviceDeploymentProfileShowCommandOptions>
{
    private readonly IDeploymentProfilesService _deploymentProfilesService;

    public FetchDeviceDeploymentProfileShowCommandHandler(IDeploymentProfilesService deviceDeploymentProfilesService)
    {
        _deploymentProfilesService = deviceDeploymentProfilesService;
    }

    public async Task<int> HandleAsync(FetchDeviceDeploymentProfileShowCommandOptions options)
    {

        var removeProvided = options.Remove;
        var accessToken = await new IdentityHelperService().GetAccessTokenSilentOrInteractiveAsync();
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
            .StartAsync("Fetching duplicate devices from Intune", async _ =>
            {
                var allDeploymentProfilesResults =
                    await _deploymentProfilesService.GetAutoPilotDeploymentProfileByNameAsync(accessToken, options.Name);
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
                profile.DeviceType,
                profile.LastModifiedDateTime.ToString(CultureInfo.InvariantCulture),
                count?.OdataCount.ToString() ?? "0"
            );
        }

        AnsiConsole.Write(table);
        return 0;
    }
}
