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
    private readonly IConfigurationPolicyService _configurationPolicyService;
    private readonly ICompliancePoliciesService _compliancePoliciesService;
    private readonly IAssignmentFiltersService _assignmentFiltersService;

    public FetchAssignmentsCommandHandler(IIdentityHelperService identityHelperService, IAssignmentsService assignmentsService,IConfigurationPolicyService configurationPolicyService, ICompliancePoliciesService compliancePoliciesService, IAssignmentFiltersService assignmentsFilterService)
    {
        _assignmentsService = assignmentsService;
        _identityHelperService = identityHelperService;
        _configurationPolicyService = configurationPolicyService;
        _compliancePoliciesService = compliancePoliciesService;
        _assignmentFiltersService = assignmentsFilterService;
    }
    public async Task<int> HandleAsync(FetchAssignmentsCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        var allResults = new List<CustomAssignmentsModel>();
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
                    var compliancePolicies =
                        await _compliancePoliciesService.GetCompliancePoliciesListAsync(accessToken);
                        var complianceResults = await _assignmentsService.GetCompliancePoliciesAssignmentsListAsync(accessToken, null, compliancePolicies);
                        if (complianceResults is not null)
                        {
                            allResults.AddRange(complianceResults);
                        }
                        // Configuration Policies
                        var configPolicies = await _configurationPolicyService.GetConfigurationPoliciesListAsync(accessToken);
                        if (configPolicies is not null)
                        {
                            var configurationResults =
                                await _assignmentsService.GetConfigurationPolicyAssignmentsListAsync(accessToken, null,
                                    configPolicies);
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
                        var updateRingResults =
                            await _assignmentsService.GetUpdateRingsAssignmentsByGroupListAsync(accessToken, null);
                        if (updateRingResults is not null)
                        {
                            allResults.AddRange(updateRingResults);
                        }
                        var featureUpdateResults =
                            await _assignmentsService.GetFeatureUpdatesAssignmentsByGroupListAsync(accessToken, null);
                        if (featureUpdateResults is not null)
                        {
                            allResults.AddRange(featureUpdateResults);
                        }
                        var driverUpdateResults =
                            await _assignmentsService.GetWindowsDriverUpdatesAssignmentsByGroupListAsync(accessToken, null);
                        if (driverUpdateResults is not null)
                        {
                            allResults.AddRange(driverUpdateResults);
                        }
                        var macOsShellScriptResults =
                            await _assignmentsService.GetMacOsShellScriptsAssignmentListAsync(accessToken, null);
                        if (macOsShellScriptResults is not null)
                        {
                            allResults.AddRange(macOsShellScriptResults);
                        }
                        var diskEncyrptionResults =
                            await _assignmentsService.GetDiskEncryptionAssignmentListAsync(accessToken, null);
                        if (diskEncyrptionResults is not null)
                        {
                            allResults.AddRange(diskEncyrptionResults);
                        }
                });

        if (allResults.Count > 0)
        {
            var allFiltersInfo =
                await _assignmentFiltersService.GetAssignmentFiltersListAsync(accessToken);
            
            var table = new Table();
            table.Collapse();
            table.Border = TableBorder.Rounded;
            table.AddColumn("ResourceType");
            table.AddColumn("ResourceId");
            table.AddColumn("ResourceName");
            table.AddColumn("AssignmentType");
            table.AddColumn("FilterName");
            table.AddColumn("FilterType");
            foreach (var filter in allResults)
            {
                var filterInfo = allFiltersInfo?.Find(g => g?.Id == filter.FilterId);
                string filterFriendly = filterInfo?.DisplayName ?? "No filter";
                filter.FilterId = filterFriendly;
                table.AddRow(
                    filter.ResourceType,
                    filter.ResourceId,
                    filter.ResourceName.EscapeMarkup(),
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
