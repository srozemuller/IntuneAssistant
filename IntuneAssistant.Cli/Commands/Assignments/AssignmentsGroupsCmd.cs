using System.CommandLine;
using System.Text;
using IntuneAssistant.Constants;
using IntuneAssistant.Extensions;
using IntuneAssistant.Extensions.HTML;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Assignments;

public class AssignmentsGroupCmd : Command<FetchAssignmentsGroupCommandOptions, FetchAssignmentsGroupCommandHandler>
{
    public AssignmentsGroupCmd() : base(CommandConfiguration.AssignmentsGroupsCommandName, CommandConfiguration.AssignmentsGroupsCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<string>(CommandConfiguration.AssignmentsGroupIdCommandName, CommandConfiguration.AssignmentsGroupIdCommandDescription));
        AddOption(new Option<string>(CommandConfiguration.AssignmentsGroupNameCommandName, CommandConfiguration.AssignmentsGroupNameCommandDescription));
        var outputOption = new Option<string>(CommandConfiguration.OutputFlags, CommandConfiguration.OutputFlagsDescription);
        outputOption.AddAlias("-o");
        AddOption(outputOption);
    }
}

public class FetchAssignmentsGroupCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
    public string GroupId { get; set; } = string.Empty;
    public string GroupName { get; set; } = string.Empty;
    public string PageSize { get; set; }
    private readonly string[] _validOutputs = { "table", "json", "csv", "html" };
    private const string DEFAULT_OUTPUT = "table";
    private string _output = DEFAULT_OUTPUT;
    public string Output
    {
        get { return _output; }
        set { _output = _validOutputs.Contains(value) ? value : DEFAULT_OUTPUT; }
    }
}

public class FetchAssignmentsGroupCommandHandler : ICommandOptionsHandler<FetchAssignmentsGroupCommandOptions>
{

    private readonly IAssignmentsService _assignmentsService;
    private readonly IGroupInformationService _groupInformationService;
    private readonly IIdentityHelperService _identityHelperService;
    private readonly IConfigurationPolicyService _configurationPolicyService;
    private readonly ICompliancePoliciesService _compliancePoliciesService;
    private readonly IAssignmentFiltersService _assignmentFiltersService;
    public FetchAssignmentsGroupCommandHandler(IIdentityHelperService identityHelperService, IAssignmentsService assignmentsService, IGroupInformationService groupInformationService, IConfigurationPolicyService configurationPolicyService, ICompliancePoliciesService compliancePoliciesService, IAssignmentFiltersService assignmentFiltersService)
    {
        _assignmentsService = assignmentsService;
        _groupInformationService = groupInformationService;
        _identityHelperService = identityHelperService;
        _configurationPolicyService = configurationPolicyService;
        _compliancePoliciesService = compliancePoliciesService;
        _assignmentFiltersService = assignmentFiltersService;
    }
    public async Task<int> HandleAsync(FetchAssignmentsGroupCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        var allResults = new List<CustomAssignmentsModel>();
        var exportCsvProvided = !string.IsNullOrWhiteSpace(options.ExportCsv);
        var groupIdProvided = !string.IsNullOrWhiteSpace(options.GroupId);
        var groupNameProvided = !string.IsNullOrWhiteSpace(options.GroupName);
        var groupInfo = new GroupModel();
        var pageSizeProvided = !string.IsNullOrEmpty(options.PageSize);
        var pageSize = AppConfiguration.TABLE_PAGESIZE;
        if (pageSizeProvided && int.TryParse(options.PageSize, out int pageSizeResult))
        {
            pageSize = pageSizeResult;
        }
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
                    $"Fetching group assignments overview from Intune",
                    async _ =>
                    {
                        var results = await FetchAllTasksAsync(accessToken, groupInfo);
                        // Combine the results from all tasks
                        if (results != null)
                        {
                            allResults.AddRange(results);
                        }
                    });
        }
        else
        {
            await AnsiConsole.Status().SpinnerStyle(Color.Orange1)
                .StartAsync(
                    $"Fetching group assignments overview from Intune",
                    async _ =>
                    {
                        var results = await FetchAllTasksAsync(accessToken, null);
                        // Combine the results from all tasks
                        if (results != null)
                        {
                            allResults.AddRange(results);
                        }
                    });
        }
        if (allResults.Any(r => r.AssignmentType == "group"))
        {
            allResults = allResults.Where(r => r.AssignmentType == "group").ToList();
            var allFiltersInfo =
                await _assignmentFiltersService.GetAssignmentFiltersListAsync(accessToken);
            var uniqueGroupIds = allResults.DistinctBy(d => d.TargetId).Select(t => t.TargetId)
                .ToList();
            // Search in every group assignment for unique group ID values. For every group ID, search for group information.
            var allGroupsInfo =
                await _groupInformationService.GetGroupInformationByIdsCollectionListAsync(accessToken,
                    uniqueGroupIds);
            foreach (var result in allResults)
            {
                if (groupIdProvided || groupNameProvided)
                {
                    string targetFriendly = groupInfo.DisplayName ?? "No target found";
                    result.TargetName = targetFriendly;
                }
                else
                {
                    // Adding the target name to the all results object. This is for exporting later.
                    var target = allGroupsInfo.Find(g => g?.Id == result.TargetId);
                    string targetFriendly = target?.DisplayName ?? "No target found";
                    result.TargetName = targetFriendly;
                }
                var filterInfo = allFiltersInfo?.Find(g => g?.Id == result.FilterId);
                string filterFriendly = filterInfo?.DisplayName ?? "No filter";
                result.FilterId = filterFriendly;
            }
            if (exportCsvProvided)
            {
                var fileLocation = ExportData.ExportCsv(allResults, options.ExportCsv);
                AnsiConsole.Write($"File stored at location {fileLocation}");
                return 0;
            }
            switch (options.Output)
            {
                case "html":
                    var bodySb = new StringBuilder();
                    bodySb.Append(HtmlTemplateHelper.GenerateAssignmentsByGroupOverview(allResults));

                    var htmlTemplate =
                        HtmlTemplateHelper.CreateHtmlPage(_identityHelperService.GetCurrentUserContext().Result.FirstOrDefault().HomeAccountId.TenantId,
                            bodySb.ToString());
                    File.WriteAllText("report.html",htmlTemplate);
                    break;
            }
            var selectedColumns = new List<string> { "ResourceType","ResourceName", "ResourceId","TargetId","TargetName","FilterId","FilterType" };
            var table = new Table();
            table.Collapse();
            table.Border = TableBorder.Rounded;
            foreach (var columnName in selectedColumns)
            {
                table.AddColumn(new TableColumn(columnName));
            }

            foreach (var result in allResults)
            {
                table.AddRow(
                    result.ResourceType,
                    result.ResourceId,
                    result.ResourceName.EscapeMarkup(),
                    result.TargetId,
                    result.TargetName.EscapeMarkup(),
                    result.FilterId,
                    result.FilterType
                );
            }
            var currentPage = 0;
            var totalPages = (int)Math.Ceiling((double)allResults.Count / pageSize);

            do
            {
                // Display the current page
                var startIdx = currentPage * pageSize;
                var endIdx = Math.Min((currentPage + 1) * pageSize, allResults.Count);
                var currentPageRows = table.Rows.Skip(startIdx).Take(endIdx - startIdx).ToList();
                var currentPageTable = new Table();

                // Add columns to the current page table
                foreach (var columnName in selectedColumns)
                {
                    currentPageTable.AddColumn(new TableColumn(columnName));
                }
                foreach (var row in currentPageRows)
                {
                    currentPageTable.AddRow(row);
                }
                AnsiConsole.Render(currentPageTable);

                // Show page information
                AnsiConsole.WriteLine($"Page {currentPage + 1} of {totalPages}");
                if (pageSize > allResults.Count)
                {
                    AnsiConsole.WriteLine("End of page");
                    break; // Exit the loop if the page size is bigger than the total count. If all results fits on one page, no ESC is needed
                }
                AnsiConsole.WriteLine($"{AppConfiguration.TABLE_PAGE_SCROLLINFO}");
                // Ask the user to go to the next page, previous page, or exit
                var key = Console.ReadKey(true).Key;

                if (key == ConsoleKey.RightArrow && currentPage < totalPages - 1)
                {
                    currentPage++;
                }
                else if (key == ConsoleKey.LeftArrow && currentPage > 0)
                {
                    currentPage--;
                }
                else if (key == ConsoleKey.Escape)
                {
                    break; // Exit the loop
                }
                // Clear the console for the next iteration
                AnsiConsole.Console.Clear();
            } while (true);
            return 0;
        }
        AnsiConsole.MarkupLine($"[yellow]No assignments found in Intune.[/]");
        return -1;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchAllTasksAsync(string accessToken, GroupModel? groupInfo)
    {
        var fetchTasks = new List<Task<List<CustomAssignmentsModel>?>>
        {
            FetchCompliancePoliciesAsync(accessToken, groupInfo),
            FetchConfigurationPoliciesAsync(accessToken, groupInfo),
            FetchDeviceScriptsAsync(accessToken, groupInfo),
            FetchHealthScriptsAsync(accessToken, groupInfo),
            FetchAutoPilotAssignmentsListAsync(accessToken, groupInfo),
            FetchAppProtectionAssignmentsListAsync(accessToken, groupInfo),
            FetchMobileAppAssignmentsListAsync(accessToken, groupInfo),
            FetchTargetAppAssignmentsListAsync(accessToken, groupInfo),
            FetchUpdateRingsAssignmentsListAsync(accessToken, groupInfo),
            FetchFeatureUpdateAssignmentsListAsync(accessToken, groupInfo),
            FetchDriverUpdateAssignmentsListAsync(accessToken, groupInfo),
            FetchMacOsScriptAssignmentsListAsync(accessToken, groupInfo),
            FetchDiskEncryptionAssignmentsListAsync(accessToken, groupInfo),
            FetchUpdatePoliciesForMacAssignmentsListAsync(accessToken, groupInfo),
            FetchPlatformScriptAssignmentsListAsync(accessToken, groupInfo),
            FetchManagedAppPolicyAssignmentListAsync(accessToken, groupInfo),
            FetchDeviceEnrollmentRestrictionsAssignmentListAsync(accessToken, groupInfo),
            FetchDeviceLimitRestrictionsAssignmentListAsync(accessToken, groupInfo),
            FetchMacOsCustomAttributesAssignmentListAsync(accessToken, groupInfo),
            FetchIosLobAppProvisioningAssignmentListAsync(accessToken, groupInfo)
        };

        // Wait for all tasks to complete
        var results = await Task.WhenAll(fetchTasks);

        // Process the results if needed
        // For example, you can concatenate all the lists into a single list
        var allModels = results.Where(x => x != null).SelectMany(x => x).ToList();
       
        return allModels;
    }
    
    private async Task<List<CustomAssignmentsModel>?> FetchCompliancePoliciesAsync(string accessToken, GroupModel? groupInfo)
    {
        var compliancePolicies =
            await _compliancePoliciesService.GetCompliancePoliciesListAsync(accessToken);
        var complianceResults = await _assignmentsService.GetCompliancePoliciesAssignmentsListAsync(accessToken, groupInfo, compliancePolicies);
        return complianceResults.Where(r => r.AssignmentType == "group").ToList();
    }
    private async Task<List<CustomAssignmentsModel>?> FetchConfigurationPoliciesAsync(string accessToken, GroupModel groupInfo)
    {
        var configPolicies = await _configurationPolicyService.GetConfigurationPoliciesListAsync(accessToken);
        var configurationResults = new List<CustomAssignmentsModel>();
        if (configPolicies is not null)
        {
            configurationResults =
                await _assignmentsService.GetConfigurationPolicyAssignmentsListAsync(accessToken, groupInfo,
                    configPolicies);
        }
        return configurationResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchDeviceScriptsAsync(string accessToken, GroupModel groupInfo)
    {
        var deviceScriptsResults = await _assignmentsService.GetDeviceManagementScriptsAssignmentsListAsync(accessToken, groupInfo);
        return deviceScriptsResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchHealthScriptsAsync(string accessToken, GroupModel groupInfo)
    {
        var healthScriptsResults = await _assignmentsService.GetHealthScriptsAssignmentsByGroupListAsync(accessToken, groupInfo);
        return healthScriptsResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchAutoPilotAssignmentsListAsync(string accessToken, GroupModel groupInfo)
    {
        var autoPilotResults = await _assignmentsService.GetAutoPilotAssignmentsByGroupListAsync(accessToken, groupInfo);
        return autoPilotResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchAppProtectionAssignmentsListAsync(string accessToken, GroupModel groupInfo)
    {
        var appProtectionResults = await _assignmentsService.GetAppProtectionAssignmentsByGroupListAsync(accessToken, groupInfo);
        return appProtectionResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchMobileAppAssignmentsListAsync(string accessToken, GroupModel groupInfo)
    {
        var mobileAppResults = await _assignmentsService.GetMobileAppAssignmentsByGroupListAsync(accessToken, groupInfo);
        return mobileAppResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchTargetAppAssignmentsListAsync(string accessToken, GroupModel groupInfo)
    {
        var targetAppResults = await _assignmentsService.GetTargetedAppConfigurationsAssignmentsByGroupListAsync(accessToken, groupInfo);
        return targetAppResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchUpdateRingsAssignmentsListAsync(string accessToken, GroupModel groupInfo)
    {
        var updateRingResults =
            await _assignmentsService.GetUpdateRingsAssignmentsByGroupListAsync(accessToken, groupInfo);
        return updateRingResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchFeatureUpdateAssignmentsListAsync(string accessToken, GroupModel groupInfo)
    {
        var featureUpdateResults =
            await _assignmentsService.GetFeatureUpdatesAssignmentsByGroupListAsync(accessToken, groupInfo);
        return featureUpdateResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchDriverUpdateAssignmentsListAsync(string accessToken, GroupModel groupInfo)
    {
        var driverUpdateResults =
            await _assignmentsService.GetWindowsDriverUpdatesAssignmentsByGroupListAsync(accessToken, groupInfo);
        return driverUpdateResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchMacOsScriptAssignmentsListAsync(string accessToken, GroupModel groupInfo)
    {
        var macOsShellScriptResults =
            await _assignmentsService.GetMacOsShellScriptsAssignmentListAsync(accessToken, groupInfo);
        return macOsShellScriptResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchDiskEncryptionAssignmentsListAsync(string accessToken, GroupModel groupInfo)
    {
        var diskEncyrptionResults =
            await _assignmentsService.GetDiskEncryptionAssignmentListAsync(accessToken, groupInfo);
        return diskEncyrptionResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchUpdatePoliciesForMacAssignmentsListAsync(string accessToken, GroupModel groupInfo)
    {
        var updatesForMacResults =
            await _assignmentsService.GetUpdatesForMacAssignmentListAsync(accessToken, groupInfo);
        return updatesForMacResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchPlatformScriptAssignmentsListAsync(string accessToken, GroupModel groupInfo)
    {
        var updatesForMacResults =
            await _assignmentsService.GetPlatformScriptsAssignmentListAsync(accessToken, groupInfo);
        return updatesForMacResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchManagedAppPolicyAssignmentListAsync(string accessToken, GroupModel groupInfo)
    {
        var managedAppResults =
            await _assignmentsService.GetManagedApplicationAssignmentListAsync(accessToken, groupInfo);
        return managedAppResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchDeviceEnrollmentRestrictionsAssignmentListAsync(string accessToken, GroupModel groupInfo)
    {
        var platformRestrictionResults =
            await _assignmentsService.GetDevicePlatformRestrictionsAssignmentListAsync(accessToken, groupInfo);
        return platformRestrictionResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchDeviceLimitRestrictionsAssignmentListAsync(string accessToken, GroupModel groupInfo)
    {
        var limitRestrictionResults =
            await _assignmentsService.GetDeviceLimitRestrictionsAssignmentListAsync(accessToken, groupInfo);
        return limitRestrictionResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchMacOsCustomAttributesAssignmentListAsync(string accessToken, GroupModel groupInfo)
    {
        var macOsCustomAttributesAssignmentResults =
            await _assignmentsService.GetMacOsCustomAttributesAssignmentListAsync(accessToken, groupInfo);
        return macOsCustomAttributesAssignmentResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchIosLobAppProvisioningAssignmentListAsync(string accessToken, GroupModel groupInfo)
    {
        var iosLobAppProvisioningAssignmentResults =
            await _assignmentsService.GetIosLobAppProvisioningAssignmentListAsync(accessToken, groupInfo);
        return iosLobAppProvisioningAssignmentResults;
    }
}
