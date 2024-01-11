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
        var fetchTasks = new List<Task<List<CustomAssignmentsModel>?>>
        {
            FetchCompliancePoliciesAsync(accessToken),
            FetchConfigurationPoliciesAsync(accessToken),
            FetchDeviceScriptsAsync(accessToken),
            FetchHealthScriptsAsync(accessToken),
            FetchAutoPilotAssignmentsListAsync(accessToken),
            FetchAppProtectionAssignmentsListAsync(accessToken),
            FetchMobileAppAssignmentsListAsync(accessToken),
            FetchTargetAppAssignmentsListAsync(accessToken),
            FetchUpdateRingsAssignmentsListAsync(accessToken),
            FetchFeatureUpdateAssignmentsListAsync(accessToken),
            FetchDriverUpdateAssignmentsListAsync(accessToken),
            FetchMacOsScriptAssignmentsListAsync(accessToken),
            FetchDiskEncryptionAssignmentsListAsync(accessToken)
        };
        await AnsiConsole.Status().SpinnerStyle(Color.Orange1)
            .StartAsync(
                $"Fetching global assignments overview from Intune",
                async _ =>
                {
                    var results = await Task.WhenAll(fetchTasks);
                    // Combine the results from all tasks
                    foreach (var result in results)
                    {
                        allResults.AddRange(result);
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

    private async Task<List<CustomAssignmentsModel>?> FetchCompliancePoliciesAsync(string accessToken)
    {
        var compliancePolicies =
            await _compliancePoliciesService.GetCompliancePoliciesListAsync(accessToken);
        var complianceResults = await _assignmentsService.GetCompliancePoliciesAssignmentsListAsync(accessToken, null, compliancePolicies);
        return complianceResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchConfigurationPoliciesAsync(string accessToken)
    {
        var configPolicies = await _configurationPolicyService.GetConfigurationPoliciesListAsync(accessToken);
        var configurationResults = new List<CustomAssignmentsModel>();
        if (configPolicies is not null)
        {
            configurationResults =
                await _assignmentsService.GetConfigurationPolicyAssignmentsListAsync(accessToken, null,
                    configPolicies);
        }
        return configurationResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchDeviceScriptsAsync(string accessToken)
    {
        var deviceScriptsResults = await _assignmentsService.GetDeviceManagementScriptsAssignmentsListAsync(accessToken, null);
        return deviceScriptsResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchHealthScriptsAsync(string accessToken)
    {
        var healthScriptsResults = await _assignmentsService.GetHealthScriptsAssignmentsByGroupListAsync(accessToken, null);
        return healthScriptsResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchAutoPilotAssignmentsListAsync(string accessToken)
    {
        var autoPilotResults = await _assignmentsService.GetAutoPilotAssignmentsByGroupListAsync(accessToken, null);
        return autoPilotResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchAppProtectionAssignmentsListAsync(string accessToken)
    {
        var appProtectionResults = await _assignmentsService.GetAppProtectionAssignmentsByGroupListAsync(accessToken, null);
        return appProtectionResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchMobileAppAssignmentsListAsync(string accessToken)
    {
        var mobileAppResults = await _assignmentsService.GetMobileAppAssignmentsByGroupListAsync(accessToken, null);
        return mobileAppResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchTargetAppAssignmentsListAsync(string accessToken)
    {
        var targetAppResults = await _assignmentsService.GetTargetedAppConfigurationsAssignmentsByGroupListAsync(accessToken, null);
        return targetAppResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchUpdateRingsAssignmentsListAsync(string accessToken)
    {
        var updateRingResults =
            await _assignmentsService.GetUpdateRingsAssignmentsByGroupListAsync(accessToken, null);
        return updateRingResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchFeatureUpdateAssignmentsListAsync(string accessToken)
    {
        var featureUpdateResults =
            await _assignmentsService.GetFeatureUpdatesAssignmentsByGroupListAsync(accessToken, null);
        return featureUpdateResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchDriverUpdateAssignmentsListAsync(string accessToken)
    {
        var driverUpdateResults =
            await _assignmentsService.GetWindowsDriverUpdatesAssignmentsByGroupListAsync(accessToken, null);
        return driverUpdateResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchMacOsScriptAssignmentsListAsync(string accessToken)
    {
        var macOsShellScriptResults =
            await _assignmentsService.GetMacOsShellScriptsAssignmentListAsync(accessToken, null);
        return macOsShellScriptResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchDiskEncryptionAssignmentsListAsync(string accessToken)
    {
        var diskEncyrptionResults =
            await _assignmentsService.GetDiskEncryptionAssignmentListAsync(accessToken, null);
        return diskEncyrptionResults;
    }


}
