using System.CommandLine;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Assignments;


public class AssignmentsGroupCmd : Command<FetchAssignmentsGroupCommandOptions, FetchAssignmentsGroupCommandHandler>
{
    public AssignmentsGroupCmd() : base(CommandConfiguration.AssignmentsGroupsCommandName, CommandConfiguration.AssignmentsGroupsCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<string>(CommandConfiguration.AssignmentsGroupIdCommandName, CommandConfiguration.AssignmentsGroupIdCommandDescription));
        AddOption(new Option<string>(CommandConfiguration.AssignmentsGroupNameCommandName, CommandConfiguration.AssignmentsGroupNameCommandDescription));
    }
}

public class FetchAssignmentsGroupCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
    public string GroupId { get; set; } = string.Empty;
    public string GroupName { get; set; } = string.Empty;
}

public class FetchAssignmentsGroupCommandHandler : ICommandOptionsHandler<FetchAssignmentsGroupCommandOptions>
{

    private readonly IAssignmentsService _assignmentsService;
    private readonly IGroupInformationService _groupInformationService;
    private readonly IIdentityHelperService _identityHelperService;

    public FetchAssignmentsGroupCommandHandler(IIdentityHelperService identityHelperService, IAssignmentsService assignmentsService, IGroupInformationService groupInformationService)
    {
        _assignmentsService = assignmentsService;
        _groupInformationService = groupInformationService;
        _identityHelperService = identityHelperService;
    }
    public async Task<int> HandleAsync(FetchAssignmentsGroupCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        var allResults = new List<AssignmentsModel>();
        var exportCsv = !string.IsNullOrWhiteSpace(options.ExportCsv);
        var groupIdProvided = !string.IsNullOrWhiteSpace(options.GroupId);
        var groupNameProvided = !string.IsNullOrWhiteSpace(options.GroupName);
        var groupInfo = new GroupModel();
        
        var table = new Table();
        table.Collapse();
        table.Border = TableBorder.Rounded;
        table.AddColumn("ResourceType");
        table.AddColumn("ResourceId");
        table.AddColumn("ResourceName");
        table.AddColumn("TargetId");
        table.AddColumn("TargetName");
        table.AddColumn("FilterId");
        table.AddColumn("FilterType");
        
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }

        if (groupIdProvided || groupNameProvided)
        {
            await AnsiConsole.Status().SpinnerStyle(Color.Orange1)
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
            await AnsiConsole.Status().SpinnerStyle(Color.Orange1)
                    .StartAsync(
                        $"Fetching compliance policy assignments based on specific group ({groupInfo.DisplayName}) from Intune",
                        async _ =>
                        {
                            var results = await _assignmentsService.GetCompliancePoliciesAssignmentsListAsync(accessToken,
                                    groupInfo);
                            if (results is not null)
                            {
                                allResults.AddRange(results);
                            }
                        });
                await AnsiConsole.Status().SpinnerStyle(Color.Orange1)
                    .StartAsync(
                        $"Fetching configuration policy assignments based on specific group ({groupInfo.DisplayName}) from Intune",
                        async _ =>
                        {
                            var results = await _assignmentsService.GetConfigurationPolicyAssignmentsListAsync(accessToken,
                                    groupInfo);
                            if (results is not null)
                            {
                                allResults.AddRange(results);
                            }
                        });
                await AnsiConsole.Status().SpinnerStyle(Color.Orange1)
                    .StartAsync(
                        $"Fetching configuration policy assignments based on specific group ({groupInfo.DisplayName}) from Intune",
                        async _ =>
                        {
                            var results = await _assignmentsService.GetDeviceManagementScriptsAssignmentsListAsync(
                                    accessToken, groupInfo);
                            if (results is not null)
                            {
                                allResults.AddRange(results);
                            }
                        });
                await AnsiConsole.Status().SpinnerStyle(Color.Orange1)
                    .StartAsync(
                        $"Fetching remediation scripts assignments based on specific group ({groupInfo.DisplayName}) from Intune",
                        async _ =>
                        {
                            var results = await _assignmentsService.GetHealthScriptsAssignmentsByGroupListAsync(accessToken,
                                groupInfo);
                            if (results is not null)
                            {
                                allResults.AddRange(results);
                            }
                        });
                await AnsiConsole.Status().SpinnerStyle(Color.Orange1)
                    .StartAsync(
                        $"Fetching auto pilot profile assignments based on specific group ({groupInfo.DisplayName}) from Intune",
                        async _ =>
                        {
                            var results = await _assignmentsService.GetAutoPilotAssignmentsByGroupListAsync(accessToken,
                                groupInfo);
                            if (results is not null)
                            {
                                allResults.AddRange(results);
                            }
                        });
                await AnsiConsole.Status().SpinnerStyle(Color.Orange1)
                    .StartAsync(
                        $"Fetching mobile application assignments based on specific group ({groupInfo.DisplayName}) from Intune",
                        async _ =>
                        {
                            var results = await _assignmentsService.GetMobileAppAssignmentsByGroupListAsync(accessToken,
                                groupInfo);
                            if (results is not null)
                            {
                                allResults.AddRange(results);
                            }
                        });
                await AnsiConsole.Status().SpinnerStyle(Color.Orange1)
                    .StartAsync(
                        $"Fetching application configuration assignments based on specific group ({groupInfo.DisplayName}) from Intune",
                        async _ =>
                        {
                            var results = await _assignmentsService.GetTargetedAppConfigurationsAssignmentsByGroupListAsync(
                                accessToken, groupInfo);
                            if (results is not null)
                            {
                                allResults.AddRange(results);
                            }
                        });
                await AnsiConsole.Status().SpinnerStyle(Color.Orange1)
                    .StartAsync(
                        $"Fetching application protection assignments based on specific group ({groupInfo.DisplayName}) from Intune",
                        async _ =>
                        {
                            var results = await _assignmentsService.GetAppProtectionAssignmentsByGroupListAsync(accessToken, groupInfo);
                            if (results is not null)
                            {
                                allResults.AddRange(results);
                            }
                        });
                if (allResults.Count > 0)
                {
                    foreach (var filter in allResults)
                    {
                        string targetFriendly = groupInfo.DisplayName ?? "No target found";
                        // Adding the target name to the all results object. This is for exporting later.
                        filter.TargetName = targetFriendly;
                        table.AddRow(
                            filter.ResourceType,
                            filter.ResourceId,
                            filter.ResourceName,
                            filter.TargetId,
                            filter.TargetName,
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
        }
        else
        {
            await AnsiConsole.Status().SpinnerStyle(Color.Orange1)
                .StartAsync(
                    $"Fetching group assignments overview from Intune",
                    async _ =>
                    {
                        var complianceResults = await _assignmentsService.GetCompliancePoliciesAssignmentsListAsync(accessToken, null);
                        if (complianceResults is not null)
                        {
                            allResults.AddRange(complianceResults.Where(r => r.AssignmentType == "group"));
                        }
                        var configurationResults = await _assignmentsService.GetConfigurationPolicyAssignmentsListAsync(accessToken, null);
                        if (configurationResults is not null)
                        {
                            allResults.AddRange(configurationResults.Where(r => r.AssignmentType == "group"));
                        }
                        var deviceScriptsResults = await _assignmentsService.GetDeviceManagementScriptsAssignmentsListAsync(accessToken, null);
                        if (deviceScriptsResults is not null)
                        {
                            allResults.AddRange(deviceScriptsResults.Where(r => r.AssignmentType == "group"));
                        }
                        var healthScriptsResults = await _assignmentsService.GetHealthScriptsAssignmentsByGroupListAsync(accessToken, null);
                        if (healthScriptsResults is not null)
                        {
                            allResults.AddRange(healthScriptsResults.Where(r => r.AssignmentType == "group"));
                        }
                        var autoPilotResults = await _assignmentsService.GetAutoPilotAssignmentsByGroupListAsync(accessToken, null);
                        if (autoPilotResults is not null)
                        {
                            allResults.AddRange(autoPilotResults.Where(r => r.AssignmentType == "group"));
                        }
                        var appProtectionResults = await _assignmentsService.GetAppProtectionAssignmentsByGroupListAsync(accessToken, null);
                        if (appProtectionResults is not null)
                        {
                            allResults.AddRange(appProtectionResults.Where(r => r.AssignmentType == "group"));
                        }
                        var mobileAppResults = await _assignmentsService.GetMobileAppAssignmentsByGroupListAsync(accessToken, null);
                        if (mobileAppResults is not null)
                        {
                            allResults.AddRange(mobileAppResults.Where(r => r.AssignmentType == "group"));
                        }
                        var targetAppResults = await _assignmentsService.GetTargetedAppConfigurationsAssignmentsByGroupListAsync(accessToken, null);
                        if (targetAppResults is not null)
                        {
                            allResults.AddRange(targetAppResults.Where(r => r.AssignmentType == "group"));
                        }
                        var updateRingsResults = await _assignmentsService.GetUpdateRingsAssignmentsByGroupListAsync(accessToken, null);
                        if (updateRingsResults is not null)
                        {
                            allResults.AddRange(updateRingsResults.Where(r => r.AssignmentType == "group"));
                        }
                        var featureUpdateResults = await _assignmentsService.GetFeatureUpdatesAssignmentsByGroupListAsync(accessToken, null);
                        if (featureUpdateResults is not null)
                        {
                            allResults.AddRange(featureUpdateResults.Where(r => r.AssignmentType == "group"));
                        }
                        var windowsDriverUpdateResults = await _assignmentsService.GetWindowsDriverUpdatesAssignmentsByGroupListAsync(accessToken, null);
                        if (windowsDriverUpdateResults is not null)
                        {
                            allResults.AddRange(windowsDriverUpdateResults.Where(r => r.AssignmentType == "group"));
                        }
                    });
            if (allResults.Count > 0)
            {
                var uniqueGroupIds = allResults.DistinctBy(d => d.TargetId).Select(t => t.TargetId)
                    .ToList();
                
                // Search in every group assignment for unique group ID values. For every group ID, search for group information. 
                {
                    var allGroupsInfo =
                        await _groupInformationService.GetGroupInformationByIdsCollectionListAsync(accessToken,
                            uniqueGroupIds);
                    foreach (var filter in allResults)
                    {
                        var target = allGroupsInfo.Find(g => g?.Id == filter.TargetId);
                        string targetFriendly = target?.DisplayName ?? "No target found";
                        filter.TargetName = targetFriendly;
                        table.AddRow(
                            filter.ResourceType,
                            filter.ResourceId,
                            filter.ResourceName,
                            filter.TargetId,
                            filter.TargetName,
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
            }
        }
        AnsiConsole.MarkupLine($"[yellow]No assignments found in Intune.[/]");
        return -1;
    }
}
