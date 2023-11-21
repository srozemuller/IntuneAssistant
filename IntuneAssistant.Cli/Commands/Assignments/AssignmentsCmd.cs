using System.CommandLine;
using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.Extensions.Logging;
using IntuneAssistant.Models;
using IntuneAssistant.Extensions;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Assignments;

public class AssignmentsCmd : Command<FetchAssignmentsCommandOptions, FetchAssignmentsCommandHandler>
{
    public AssignmentsCmd() : base(CommandConfiguration.AssignmentsCommandName, CommandConfiguration.AssignmentsCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<string>(CommandConfiguration.AssignmentsGroupIdCommandName, CommandConfiguration.AssignmentsGroupIdCommandDescription));
        AddOption(new Option<string>(CommandConfiguration.AssignmentsGroupNameCommandName, CommandConfiguration.AssignmentsGroupNameCommandDescription));
    }
}

public class FetchAssignmentsCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
    public string GroupId { get; set; } = string.Empty;
    public string GroupName { get; set; } = string.Empty;
}

public class FetchAssignmentsCommandHandler : ICommandOptionsHandler<FetchAssignmentsCommandOptions>
{

    private readonly IAssignmentsService _assignmentsService;
    private readonly IGroupInformationService _groupInformationService;
    private readonly IIdentityHelperService _identityHelperService;

    public FetchAssignmentsCommandHandler(IIdentityHelperService identityHelperService, IAssignmentsService assignmentsService, IGroupInformationService groupInformationService)
    {
        _assignmentsService = assignmentsService;
        _groupInformationService = groupInformationService;
        _identityHelperService = identityHelperService;
    }
    public async Task<int> HandleAsync(FetchAssignmentsCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        var allResults = new List<AssignmentsModel>();
        var exportCsv = !string.IsNullOrWhiteSpace(options.ExportCsv);
        var groupIdProvided = !string.IsNullOrWhiteSpace(options.GroupId);
        var groupNameProvided = !string.IsNullOrWhiteSpace(options.GroupName);
        var groupInfo = new Microsoft.Graph.Beta.Models.Group();
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }

        if (groupIdProvided || groupNameProvided)
        {
            await AnsiConsole.Status()
                .StartAsync("Fetching group information from Entra ID",
                    async _ =>
                    {
                        if (groupIdProvided)
                        {

                                groupInfo = await _groupInformationService.GetGroupInformationByIdAsync(accessToken,
                                    options.GroupId);
                        }
                        else
                        {
                            groupInfo = await _groupInformationService.GetGroupInformationByNameAsync(accessToken,
                                options.GroupName);
                        }
                    });
            if (groupInfo is null)
            {
                AnsiConsole.MarkupLine($"[red]No group found! Provided {options.GroupId}{options.GroupName}[/]");
                return -1;
            }

            await AnsiConsole.Status()
                    .StartAsync(
                        $"Fetching compliance policy assignments based on specific group ({groupInfo.DisplayName}) from Intune",
                        async _ =>
                        {
                            var results = new List<AssignmentsModel>();
                            results =
                                await _assignmentsService.GetCompliancePolicyAssignmentsByGroupListAsync(accessToken,
                                    groupInfo);
                            if (results is not null)
                            {
                                allResults.AddRange(results);
                            }
                        });
                await AnsiConsole.Status()
                    .StartAsync(
                        $"Fetching configuration policy assignments based on specific group ({groupInfo.DisplayName}) from Intune",
                        async _ =>
                        {
                            var results = new List<AssignmentsModel>();
                            results =
                                await _assignmentsService.GetConfigurationPolicyAssignmentsByGroupListAsync(accessToken,
                                    groupInfo);
                            if (results is not null)
                            {
                                allResults.AddRange(results);
                            }
                        });
                await AnsiConsole.Status()
                    .StartAsync(
                        $"Fetching configuration policy assignments based on specific group ({groupInfo.DisplayName}) from Intune",
                        async _ =>
                        {
                            var results = new List<AssignmentsModel>();
                            results =
                                await _assignmentsService.GetDeviceManagementScriptsAssignmentsByGroupListAsync(
                                    accessToken, groupInfo);
                            if (results is not null)
                            {
                                allResults.AddRange(results);
                            }
                        });
                await AnsiConsole.Status()
                    .StartAsync(
                        $"Fetching remediation scripts assignments based on specific group ({groupInfo.DisplayName}) from Intune",
                        async _ =>
                        {
                            var results = new List<AssignmentsModel>();
                            results = await _assignmentsService.GetHealthScriptsAssignmentsByGroupListAsync(accessToken,
                                groupInfo);
                            if (results is not null)
                            {
                                allResults.AddRange(results);
                            }
                        });
                await AnsiConsole.Status()
                    .StartAsync(
                        $"Fetching auto pilot profile assignments based on specific group ({groupInfo.DisplayName}) from Intune",
                        async _ =>
                        {
                            var results = new List<AssignmentsModel>();
                            results = await _assignmentsService.GetAutoPilotAssignmentsByGroupListAsync(accessToken,
                                groupInfo);
                            if (results is not null)
                            {
                                allResults.AddRange(results);
                            }
                        });
                await AnsiConsole.Status()
                    .StartAsync(
                        $"Fetching mobile application assignments based on specific group ({groupInfo.DisplayName}) from Intune",
                        async _ =>
                        {
                            var results = new List<AssignmentsModel>();
                            results = await _assignmentsService.GetMobileAppAssignmentsByGroupListAsync(accessToken,
                                groupInfo);
                            if (results is not null)
                            {
                                allResults.AddRange(results);
                            }
                        });
                await AnsiConsole.Status()
                    .StartAsync(
                        $"Fetching application configuration assignments based on specific group ({groupInfo.DisplayName}) from Intune",
                        async _ =>
                        {
                            var results = new List<AssignmentsModel>();
                            results =
                                await _assignmentsService.GetTargetedAppConfigurationsAssignmentsByGroupListAsync(
                                    accessToken, groupInfo);
                            if (results is not null)
                            {
                                allResults.AddRange(results);
                            }
                        });
                await AnsiConsole.Status()
                    .StartAsync(
                        $"Fetching application protection assignments based on specific group ({groupInfo.DisplayName}) from Intune",
                        async _ =>
                        {
                            var results = new List<AssignmentsModel>();
                            results = await _assignmentsService.GetAppProtectionAssignmentsByGroupListAsync(accessToken,
                                groupInfo);
                            if (results is not null)
                            {
                                allResults.AddRange(results);
                            }
                        });
        }
        if (exportCsv)
        {
            await AnsiConsole.Status()
                .StartAsync($"Exporting results to {options.ExportCsv}",
                    async _ => { ExportData.ExportCsv(allResults, options.ExportCsv); });
        }

        if (allResults.Count > 0)
        {
            var table = new Table();
            table.Collapse();
            table.AddColumn("ResourceType");
            table.AddColumn("ResourceId");
            table.AddColumn("ResourceName");
            table.AddColumn("AssignmentType");
            table.AddColumn("TargetId");
            table.AddColumn("TargetName");
            foreach (var filter in allResults)
            {
                table.AddRow(
                    filter.ResourceType,
                    filter.ResourceId,
                    filter.ResourceName,
                    filter.AssignmentType,
                    filter.TargetId,
                    groupInfo.DisplayName
                );
            }
            AnsiConsole.Write(table);
            return 0;
        }
        AnsiConsole.MarkupLine($"[yellow]No filters found in Intune, consider using filters. Using filters is a best practice.[/]");
        return -1;
    }
}
