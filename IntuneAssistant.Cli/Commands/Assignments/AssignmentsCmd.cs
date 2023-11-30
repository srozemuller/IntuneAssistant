using System.CommandLine;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using IntuneAssistant.Extensions;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Assignments;

public class AssignmentsCmd : Command<FetchAssignmentsCommandOptions, FetchAssignmentsCommandHandler>
{
    public AssignmentsCmd() : base(CommandConfiguration.AssignmentsCommandName, CommandConfiguration.AssignmentsCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
    }
}

public class FetchAssignmentsCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
}

public class FetchAssignmentsCommandHandler : ICommandOptionsHandler<FetchAssignmentsCommandOptions>
{

    private readonly IAssignmentsService _assignmentsService;
    private readonly IIdentityHelperService _identityHelperService;

    public FetchAssignmentsCommandHandler(IIdentityHelperService identityHelperService, IAssignmentsService assignmentsService)
    {
        _assignmentsService = assignmentsService;
        _identityHelperService = identityHelperService;
    }
    public async Task<int> HandleAsync(FetchAssignmentsCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        var allResults = new List<AssignmentsModel>();
        var exportCsv = !string.IsNullOrWhiteSpace(options.ExportCsv);
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }
        await AnsiConsole.Status().SpinnerStyle(Color.Orange1)
            .StartAsync(
                $"Fetching global assignments overview from Intune",
                async _ =>
                {
                        var complianceResults = await _assignmentsService.GetCompliancePoliciesAssignmentsListAsync(accessToken, null);
                        if (complianceResults is not null)
                        {
                            allResults.AddRange(complianceResults);
                        }
                        var configurationResults = await _assignmentsService.GetConfigurationPolicyAssignmentsListAsync(accessToken, null);
                        if (configurationResults is not null)
                        {
                            allResults.AddRange(configurationResults);
                        }
                        var deviceScriptsResults = await _assignmentsService.GetDeviceManagementScriptsAssignmentsListAsync(accessToken, null);
                        if (deviceScriptsResults is not null)
                        {
                            allResults.AddRange(deviceScriptsResults);
                        }
                        var healthScriptsResults = await _assignmentsService.GetHealthScriptsAssignmentsByGroupListAsync(accessToken, null);
                        if (healthScriptsResults is not null)
                        {
                            allResults.AddRange(healthScriptsResults);
                        }
                        var autoPilotResults = await _assignmentsService.GetAutoPilotAssignmentsByGroupListAsync(accessToken, null);
                        if (autoPilotResults is not null)
                        {
                            allResults.AddRange(autoPilotResults);
                        }
                        var appProtectionResults = await _assignmentsService.GetAppProtectionAssignmentsByGroupListAsync(accessToken, null);
                        if (appProtectionResults is not null)
                        {
                            allResults.AddRange(appProtectionResults);
                        }
                        var mobileAppResults = await _assignmentsService.GetMobileAppAssignmentsByGroupListAsync(accessToken, null);
                        if (mobileAppResults is not null)
                        {
                            allResults.AddRange(mobileAppResults);
                        }
                        var targetAppResults = await _assignmentsService.GetTargetedAppConfigurationsAssignmentsByGroupListAsync(accessToken, null);
                        if (targetAppResults is not null)
                        {
                            allResults.AddRange(targetAppResults);
                        }
                });
        if (allResults.Count > 0)
        {
            
            var table = new Table();
            table.Collapse();
            table.AddColumn("ResourceType");
            table.AddColumn("ResourceId");
            table.AddColumn("ResourceName");
            table.AddColumn("AssignmentType");
            table.AddColumn("FilterId");
            table.AddColumn("FilterType");
            foreach (var filter in allResults)
            {
                table.AddRow(
                    filter.ResourceType,
                    filter.ResourceId,
                    filter.ResourceName,
                    filter.AssignmentType,
                    filter.FilterId,
                    filter.FilterType
                );
            }
            AnsiConsole.Write(table);
            if (exportCsv)
            {
                var fileLocation = ExportData.ExportCsv(allResults, options.ExportCsv);
                AnsiConsole.Write($"File stored at location {fileLocation}");
            }
            return 0;
        }
        AnsiConsole.MarkupLine($"[yellow]No assignments found in Intune.[/]");
        return -1;
    }
}
