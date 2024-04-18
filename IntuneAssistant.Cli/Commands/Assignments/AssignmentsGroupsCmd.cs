using System.CommandLine;
using System.Text;
using IntuneAssistant.Constants;
using IntuneAssistant.Extensions;
using IntuneAssistant.Extensions.HTML;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using IntuneAssistant.Models.Group;
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
    private readonly IAppsService _appsService;
    private readonly IGroupInformationService _groupInformationService;
    private readonly IIdentityHelperService _identityHelperService;
    private readonly IIntentsService _intentService;
    private readonly IConfigurationPolicyService _configurationPolicyService;
    private readonly ICompliancePoliciesService _compliancePoliciesService;
    private readonly IDeviceScriptsService _deviceScriptsService;
    private readonly IAssignmentFiltersService _assignmentFiltersService;
    private readonly IAutoPilotService _autoPilotService;
    private readonly IUpdatesService _updatesService;
    public FetchAssignmentsGroupCommandHandler(IIntentsService intentService, IUpdatesService updatesService, IAppsService appsService, IAutoPilotService autoPilotService, IDeviceScriptsService deviceScriptsService, IIdentityHelperService identityHelperService, IAssignmentsService assignmentsService, IGroupInformationService groupInformationService, IConfigurationPolicyService configurationPolicyService, ICompliancePoliciesService compliancePoliciesService, IAssignmentFiltersService assignmentFiltersService)
    {
        _assignmentsService = assignmentsService;
        _appsService = appsService;
        _groupInformationService = groupInformationService;
        _identityHelperService = identityHelperService;
        _intentService = intentService;
        _configurationPolicyService = configurationPolicyService;
        _compliancePoliciesService = compliancePoliciesService;
        _assignmentFiltersService = assignmentFiltersService;
        _deviceScriptsService = deviceScriptsService;
        _autoPilotService = autoPilotService;
        _updatesService = updatesService;
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
    private async Task<List<CustomAssignmentsModel>?> FetchAllTasksAsync(string? accessToken, GroupModel? groupInfo)
    {
        var fetchTasks = new List<Task<List<CustomAssignmentsModel>?>>
        {
            FetchCompliancePoliciesAsync(accessToken, groupInfo),
            FetchConfigurationPoliciesAsync(accessToken, groupInfo),
            FetchDeviceScriptsAsync(accessToken, groupInfo),
            FetchHealthScriptsAsync(accessToken, groupInfo),
            FetchAutoPilotAssignmentsListAsync(accessToken, groupInfo),
            FetchWindowsAppProtectionAssignmentsListAsync(accessToken, groupInfo),
            FetchMobileAppAssignmentsListAsync(accessToken, groupInfo),
            FetchTargetAppAssignmentsListAsync(accessToken, groupInfo),
            FetchFeatureUpdateAssignmentsListAsync(accessToken, groupInfo),
            FetchDriverUpdateAssignmentsListAsync(accessToken, groupInfo),
            FetchDiskEncryptionAssignmentsListAsync(accessToken, groupInfo),
            FetchManagedAppPolicyAssignmentListAsync(accessToken, groupInfo),
            FetchDeviceEnrollmentRestrictionsAssignmentListAsync(accessToken, groupInfo),
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
    
    private async Task<List<CustomAssignmentsModel>?> FetchCompliancePoliciesAsync(string? accessToken, GroupModel? groupInfo)
    {
        var compliancePolicies =
            await _compliancePoliciesService.GetCompliancePoliciesListAsync(accessToken);
        if (compliancePolicies is null)
        {
            return null;
        }
        var complianceResults = await _assignmentsService.GetCompliancePoliciesAssignmentsListAsync(accessToken, groupInfo, compliancePolicies);
        return complianceResults.Where(r => r.AssignmentType == "group").ToList();
    }
    private async Task<List<CustomAssignmentsModel>?> FetchConfigurationPoliciesAsync(string? accessToken, GroupModel groupInfo)
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
    private async Task<List<CustomAssignmentsModel>?> FetchDeviceScriptsAsync(string? accessToken, GroupModel groupInfo)
    {
        var deviceScripts = await _deviceScriptsService.GetDeviceManagementScriptsListAsync(accessToken);
        if (deviceScripts is null)
        {
            return null;
        }
        var deviceScriptsResults = await _assignmentsService.GetDeviceManagementScriptsAssignmentsListAsync(accessToken, groupInfo, deviceScripts);
        return deviceScriptsResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchHealthScriptsAsync(string? accessToken, GroupModel groupInfo)
    {
        var healthScripts = await _deviceScriptsService.GetDeviceHealthScriptsListAsync(accessToken);
        if (healthScripts is null)
        {
            return null;
        }
        var healthScriptsResults = await _assignmentsService.GetHealthScriptsAssignmentsListAsync(accessToken, groupInfo, healthScripts);
        return healthScriptsResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchAutoPilotAssignmentsListAsync(string? accessToken, GroupModel groupInfo)
    {
        var autopilotProfiles = await _autoPilotService.GetWindowsAutopilotDeploymentProfilesListAsync(accessToken);
        if (autopilotProfiles is null)
        {
            return null;
        }
        var autoPilotResults = await _assignmentsService.GetAutoPilotAssignmentsListAsync(accessToken, groupInfo, autopilotProfiles);
        return autoPilotResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchWindowsAppProtectionAssignmentsListAsync(string accessToken, GroupModel groupInfo)
    {
        var windowsAppProtections = await _appsService.GetWindowsManagedAppProtectionsListAsync(accessToken);
        if (windowsAppProtections is null)
        {
            return null;
        }
        var appProtectionResults = await _assignmentsService.GetWindowsAppProtectionAssignmentsListAsync(accessToken, groupInfo, windowsAppProtections);
        return appProtectionResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchMobileAppAssignmentsListAsync(string accessToken, GroupModel groupInfo)
    {
        var mobileApps = await _appsService.GetMobileAppsListAsync(accessToken);
        if (mobileApps is null)
        {
            return null;
        }
        var mobileAppResults = await _assignmentsService.GetMobileAppAssignmentsListAsync(accessToken, groupInfo, mobileApps);
        return mobileAppResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchTargetAppAssignmentsListAsync(string accessToken, GroupModel groupInfo)
    {
        var appConfigurations = await _appsService.GetTargetedManagedAppConfigurationsListAsync(accessToken);
        if (appConfigurations is null)
        {
            return null;
        }
        var targetAppResults = await _assignmentsService.GetTargetedAppConfigurationsAssignmentsListAsync(accessToken, groupInfo, appConfigurations);
        return targetAppResults;
    }

    private async Task<List<CustomAssignmentsModel>?> FetchFeatureUpdateAssignmentsListAsync(string? accessToken, GroupModel groupInfo)
    {
        var featureUpdateProfiles = await _updatesService.GetWindowsFeatureUpdatesListAsync(accessToken);
        if (featureUpdateProfiles is null)
        {
            return null;
        }
        var featureUpdateResults =
            await _assignmentsService.GetWindowsFeatureUpdatesAssignmentsListAsync(accessToken, groupInfo, featureUpdateProfiles);
        return featureUpdateResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchDriverUpdateAssignmentsListAsync(string? accessToken, GroupModel groupInfo)
    {
        var windowsDriverUpdates = await _updatesService.GetWindowsDriversUpdatesListAsync(accessToken);
        if (windowsDriverUpdates is null)
        {
            return null;
        }
        var driverUpdateResults =
            await _assignmentsService.GetWindowsDriverUpdatesAssignmentsListAsync(accessToken, groupInfo, windowsDriverUpdates);
        return driverUpdateResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchDiskEncryptionAssignmentsListAsync(string? accessToken, GroupModel groupInfo)
    {
        var diskEncryptionProfiles = await _intentService.GetDiskEncryptionPoliciesListAsync(accessToken);
        if (diskEncryptionProfiles is null)
        {
            return null;
        }
        var diskEncryptionResults =
            await _assignmentsService.GetIntentsAssignmentListAsync(accessToken, groupInfo, diskEncryptionProfiles);
        return diskEncryptionResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchManagedAppPolicyAssignmentListAsync(string? accessToken, GroupModel groupInfo)
    {
        var managedAppResults =
            await _assignmentsService.GetManagedApplicationAssignmentListAsync(accessToken, groupInfo);
        return managedAppResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchDeviceEnrollmentRestrictionsAssignmentListAsync(string accessToken, GroupModel groupInfo)
    {
        var deviceEnrollmentConfigurations =
            await _autoPilotService.GetGlobalDeviceEnrollmentForAssignmentsListAsync(accessToken);
        if (deviceEnrollmentConfigurations is null)
        {
            return null;
        }
        var platformRestrictionResults =
            await _assignmentsService.GetDeviceEnrollmentAssignmentListAsync(accessToken, groupInfo, deviceEnrollmentConfigurations);
        return platformRestrictionResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchMacOsCustomAttributesAssignmentListAsync(string accessToken, GroupModel groupInfo)
    {
        var macOsCustomAttributeScripts =
            await _deviceScriptsService.GetMacOsCustomAttributesScriptsAssignmentsListAsync(accessToken);
        if (macOsCustomAttributeScripts is null)
        {
            return null;
        }
        var macOsCustomAttributesAssignmentResults =
            await _assignmentsService.GetMacOsCustomAttributesAssignmentListAsync(accessToken, groupInfo, macOsCustomAttributeScripts);
        return macOsCustomAttributesAssignmentResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchIosLobAppProvisioningAssignmentListAsync(string accessToken, GroupModel groupInfo)
    {
        var iosLobAppProvisioningAssignments =
            await _appsService.GetIosLobAppProvisioningAssignmentsListAsync(accessToken);
        if (iosLobAppProvisioningAssignments is null)
        {
            return null;
        }
        var iosLobAppProvisioningAssignmentResults =
            await _assignmentsService.GetIosLobAppProvisioningAssignmentListAsync(accessToken, groupInfo, iosLobAppProvisioningAssignments);
        return iosLobAppProvisioningAssignmentResults;
    }
}