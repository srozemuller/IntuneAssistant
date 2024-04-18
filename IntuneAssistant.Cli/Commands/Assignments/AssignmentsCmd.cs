using System.CommandLine;
using System.Text;
using IntuneAssistant.Constants;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using IntuneAssistant.Extensions;
using IntuneAssistant.Extensions.HTML;
using Microsoft.IdentityModel.Tokens;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Assignments;

public class AssignmentsCmd : Command<FetchAssignmentsCommandOptions, FetchAssignmentsCommandHandler>
{
    public AssignmentsCmd() : base(CommandConfiguration.AssignmentsCommandName, CommandConfiguration.AssignmentsCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription)); 
        var outputOption = new Option<string>(CommandConfiguration.OutputFlags, CommandConfiguration.OutputFlagsDescription);
        outputOption.AddAlias("-o");
        AddOption(outputOption);
    }
}

public class FetchAssignmentsCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
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

public class FetchAssignmentsCommandHandler : ICommandOptionsHandler<FetchAssignmentsCommandOptions>
{

    private readonly IAssignmentsService _assignmentsService;
    private readonly IAppsService _appsService;
    private readonly IIdentityHelperService _identityHelperService;
    private readonly IIntentsService _intentService;
    private readonly IConfigurationPolicyService _configurationPolicyService;
    private readonly ICompliancePoliciesService _compliancePoliciesService;
    private readonly IAssignmentFiltersService _assignmentFiltersService;
    private readonly IGroupInformationService _groupInformationService;
    private readonly IDeviceScriptsService _deviceScriptsService;
    private readonly IAutoPilotService _autoPilotService;
    private readonly IUpdatesService _updatesService;

    public FetchAssignmentsCommandHandler(IIntentsService intentService, IUpdatesService updatesService, IAppsService appsService, IAutoPilotService autoPilotService, IDeviceScriptsService deviceScriptsService, IGroupInformationService groupInformationService, IIdentityHelperService identityHelperService, IAssignmentsService assignmentsService,IConfigurationPolicyService configurationPolicyService, ICompliancePoliciesService compliancePoliciesService, IAssignmentFiltersService assignmentsFilterService)
    {
        _assignmentsService = assignmentsService;
        _appsService = appsService;
        _identityHelperService = identityHelperService;
        _intentService = intentService;
        _configurationPolicyService = configurationPolicyService;
        _compliancePoliciesService = compliancePoliciesService;
        _assignmentFiltersService = assignmentsFilterService;
        _groupInformationService = groupInformationService;
        _deviceScriptsService = deviceScriptsService;
        _autoPilotService = autoPilotService;
        _updatesService = updatesService;
    }
    public async Task<int> HandleAsync(FetchAssignmentsCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        var allResults = new List<CustomAssignmentsModel>();
        var exportCsvProvided = !string.IsNullOrWhiteSpace(options.ExportCsv);
        var pageSizeProvided = !string.IsNullOrEmpty(options.PageSize);
        var pageSize = AppConfiguration.TABLE_PAGESIZE;
        var allFiltersInfo = new List<AssignmentFiltersModel>();
        if (pageSizeProvided && int.TryParse(options.PageSize, out int pageSizeResult))
        {
            pageSize = pageSizeResult;
        }
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }
        var fetchTasks = new List<Task<List<CustomAssignmentsModel>?>>
        {
            FetchCompliancePoliciesAsync(accessToken),
            FetchConfigurationPoliciesAsync(accessToken),
            FetchDeviceShellScriptsAsync(accessToken),
            FetchDeviceConfigurationsAsync(accessToken), 
            FetchGroupPolicyConfigurationsAsync(accessToken), 
            FetchDeviceManagementScriptsAsync(accessToken),
            FetchHealthScriptsAsync(accessToken),
            FetchAutoPilotAssignmentsListAsync(accessToken),
            FetchWindowsAppProtectionAssignmentsListAsync(accessToken),
            FetchIosAppProtectionAssignmentsListAsync(accessToken),
            FetchAndroidAppProtectionAssignmentsListAsync(accessToken),
            FetchMobileAppAssignmentsListAsync(accessToken),
            FetchTargetAppAssignmentsListAsync(accessToken),
            FetchFeatureUpdateAssignmentsListAsync(accessToken),
            FetchDriverUpdateAssignmentsListAsync(accessToken),
            FetchDiskEncryptionAssignmentsListAsync(accessToken),
            FetchDeviceEnrollmentRestrictionsAssignmentListAsync(accessToken),
            FetchMacOsCustomAttributesAssignmentListAsync(accessToken),
            FetchIosLobAppProvisioningAssignmentListAsync(accessToken)
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
                        if (result != null) allResults.AddRange(result);
                    }
                });
        if (allResults.Count > 0)
        {
            allFiltersInfo =
                await _assignmentFiltersService.GetAssignmentFiltersListAsync(accessToken);
            var uniqueGroupIds = allResults.DistinctBy(d => d.TargetId).Where(v => !v.TargetId.IsNullOrEmpty()).Select(g => g.TargetId).ToList();
            var allGroupsInfo = await _groupInformationService.GetGroupInformationByIdsCollectionListAsync(accessToken,
                    uniqueGroupIds);
            foreach (var result in allResults)
            {
                var target = allGroupsInfo.Find(g => g.Id == result.TargetId);
                string targetFriendly = target?.DisplayName ?? "-";
                result.TargetName = targetFriendly;
                var filterInfo = allFiltersInfo?.Find(g => g?.Id == result.FilterId);
                result.FilterId = filterInfo?.DisplayName ?? "No filter";
            }
        }

        if (exportCsvProvided)
        {
            var fileLocation =   ExportData.ExportCsv(allResults, options.ExportCsv);
            AnsiConsole.Write($"File stored at location {fileLocation}");
            return 0;
        }
        
        switch (options.Output)
        {
            case "html":
                var bodySb = new StringBuilder();
                bodySb.Append(HtmlTemplateHelper.GenerateAssignmentsOverview(allResults));

                var htmlTemplate =
                    HtmlTemplateHelper.CreateHtmlPage(_identityHelperService.GetCurrentUserContext().Result.FirstOrDefault().HomeAccountId.TenantId,
                        bodySb.ToString());
                File.WriteAllText("report.html",htmlTemplate);
                break;
        }
        
        var selectedColumns = new List<string> { "ResourceType","ResourceName", "ResourceId","IsAssigned","AssignmentType","TargetName","FilterId","FilterType" };
        // Create a table with dynamic columns
        var table = new Table();
        table.Collapse();
        table.Border = TableBorder.Rounded;
        // Add columns to your table dynamically based on the properties of the data type
        foreach (var columnName in selectedColumns)
        {
            table.AddColumn(new TableColumn(columnName));
        }

        // Populate the table with data
        foreach (var item in allResults)
        {
            table.AddRow(
                item.ResourceType.EscapeMarkup(),
                item.ResourceName.EscapeMarkup(),
                item.ResourceId,
                item.IsAssigned.ToString(),
                item.AssignmentType,
                item.TargetName,
                item.FilterId,
                item.FilterType
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

    private async Task<List<CustomAssignmentsModel>?> FetchCompliancePoliciesAsync(string? accessToken)
    {
        var compliancePolicies =
            await _compliancePoliciesService.GetCompliancePoliciesListAsync(accessToken);
        if (compliancePolicies is null)
        {
            return null;
        }
        var complianceResults = await _assignmentsService.GetCompliancePoliciesAssignmentsListAsync(accessToken, null, compliancePolicies);
        return complianceResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchDeviceConfigurationsAsync(string? accessToken)
    {
        var deviceConfigurations =
            await _configurationPolicyService.GetDeviceConfigurationsListAsync(accessToken);
        if (deviceConfigurations is null)
        {
            return null;
        }
        var deviceConfigurationsResults = await _assignmentsService.GetDeviceConfigurationsAssignmentsListAsync(accessToken, null, deviceConfigurations);
        return deviceConfigurationsResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchGroupPolicyConfigurationsAsync(string? accessToken)
    {
        var groupPolicyConfigurations =
            await _configurationPolicyService.GetGroupPolicyConfigurationsListAsync(accessToken);
        if (groupPolicyConfigurations is null)
        {
            return null;
        }
        var groupPolicyResults = await _assignmentsService.GetGroupPolicyConfigurationsAssignmentsListAsync(accessToken, null, groupPolicyConfigurations);
        return groupPolicyResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchConfigurationPoliciesAsync(string? accessToken)
    {
        var configPolicies = await _configurationPolicyService.GetConfigurationPoliciesListAsync(accessToken);
        if (configPolicies is null)
        {
            return null;
        }
        var configurationResults =
            await _assignmentsService.GetConfigurationPolicyAssignmentsListAsync(accessToken, null,
                configPolicies);
        return configurationResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchDeviceManagementScriptsAsync(string? accessToken)
    {
        var deviceManagementScripts = await _deviceScriptsService.GetDeviceManagementScriptsListAsync(accessToken);
        if (deviceManagementScripts is null)
        {
            return null;
        }
        var deviceScriptsResults = await _assignmentsService.GetDeviceManagementScriptsAssignmentsListAsync(accessToken, null, deviceManagementScripts);
        return deviceScriptsResults;
    }
    
    private async Task<List<CustomAssignmentsModel>?> FetchDeviceShellScriptsAsync(string? accessToken)
    {
        var deviceShellScripts = await _deviceScriptsService.GetDeviceShellScriptsListAsync(accessToken);
        if (deviceShellScripts is null)
        {
            return null;
        }
        var deviceScriptsResults = await _assignmentsService.GetDeviceShellScriptsAssignmentsListAsync(accessToken, null, deviceShellScripts);
        return deviceScriptsResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchHealthScriptsAsync(string? accessToken)
    {
        var healthScripts = await _deviceScriptsService.GetDeviceHealthScriptsListAsync(accessToken);
        if (healthScripts is null)
        {
            return null;
        }
        var healthScriptsResults = await _assignmentsService.GetHealthScriptsAssignmentsListAsync(accessToken, null, healthScripts);
        return healthScriptsResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchAutoPilotAssignmentsListAsync(string? accessToken)
    {
        var autopilotProfiles = await _autoPilotService.GetWindowsAutopilotDeploymentProfilesListAsync(accessToken);
        if (autopilotProfiles is null)
        {
            return null;
        }
        var autoPilotResults = await _assignmentsService.GetAutoPilotAssignmentsListAsync(accessToken, null, autopilotProfiles);
        return autoPilotResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchWindowsAppProtectionAssignmentsListAsync(string accessToken)
    {
        var windowsAppProtections = await _appsService.GetWindowsManagedAppProtectionsListAsync(accessToken);
        if (windowsAppProtections is null)
        {
            return null;
        }
        var appProtectionResults = await _assignmentsService.GetWindowsAppProtectionAssignmentsListAsync(accessToken, null, windowsAppProtections);
        return appProtectionResults;
    }
    
    private async Task<List<CustomAssignmentsModel>?> FetchIosAppProtectionAssignmentsListAsync(string accessToken)
    {
        var iosAppProtections = await _appsService.GetIosAppProtectionsListAsync(accessToken);
        if (iosAppProtections is null)
        {
            return null;
        }
        var appProtectionResults = await _assignmentsService.GetIosAppProtectionAssignmentsListAsync(accessToken, null, iosAppProtections);
        return appProtectionResults;
    }
    
    private async Task<List<CustomAssignmentsModel>?> FetchAndroidAppProtectionAssignmentsListAsync(string accessToken)
    {
        var androidAppProtections = await _appsService.GetAndroidAppProtectionsListAsync(accessToken);
        if (androidAppProtections is null)
        {
            return null;
        }
        var appProtectionResults = await _assignmentsService.GetAndroidAppProtectionAssignmentsListAsync(accessToken, null, androidAppProtections);
        return appProtectionResults;
    }
    
    private async Task<List<CustomAssignmentsModel>?> FetchMobileAppAssignmentsListAsync(string accessToken)
    {
        var mobileApps = await _appsService.GetMobileAppsListAsync(accessToken);
        if (mobileApps is null)
        {
            return null;
        }
        var mobileAppResults = await _assignmentsService.GetMobileAppAssignmentsListAsync(accessToken, null, mobileApps);
        return mobileAppResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchTargetAppAssignmentsListAsync(string accessToken)
    {
        var appConfigurations = await _appsService.GetTargetedManagedAppConfigurationsListAsync(accessToken);
        if (appConfigurations is null)
        {
            return null;
        }
        var targetAppResults = await _assignmentsService.GetTargetedAppConfigurationsAssignmentsListAsync(accessToken, null, appConfigurations);
        return targetAppResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchFeatureUpdateAssignmentsListAsync(string? accessToken)
    {
        var featureUpdateProfiles = await _updatesService.GetWindowsFeatureUpdatesListAsync(accessToken);
        if (featureUpdateProfiles is null)
        {
            return null;
        }
        var featureUpdateResults =
            await _assignmentsService.GetWindowsFeatureUpdatesAssignmentsListAsync(accessToken, null, featureUpdateProfiles);
        return featureUpdateResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchDriverUpdateAssignmentsListAsync(string? accessToken)
    {
        var windowsDriverUpdates = await _updatesService.GetWindowsDriversUpdatesListAsync(accessToken);
        if (windowsDriverUpdates is null)
        {
            return null;
        }
        var driverUpdateResults =
            await _assignmentsService.GetWindowsDriverUpdatesAssignmentsListAsync(accessToken, null, windowsDriverUpdates);
        return driverUpdateResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchDiskEncryptionAssignmentsListAsync(string? accessToken)
    {
        var diskEncryptionProfiles = await _intentService.GetAllIntentsListAsync(accessToken);
        if (diskEncryptionProfiles is null)
        {
            return null;
        }
        var diskEncryptionResults =
            await _assignmentsService.GetIntentsAssignmentListAsync(accessToken, null, diskEncryptionProfiles);
        return diskEncryptionResults;
    }

    private async Task<List<CustomAssignmentsModel>?> FetchDeviceEnrollmentRestrictionsAssignmentListAsync(string accessToken)
    {
        var deviceEnrollmentConfigurations =
            await _autoPilotService.GetGlobalDeviceEnrollmentForAssignmentsListAsync(accessToken);
        if (deviceEnrollmentConfigurations is null)
        {
            return null;
        }
        var platformRestrictionResults =
            await _assignmentsService.GetDeviceEnrollmentAssignmentListAsync(accessToken, null, deviceEnrollmentConfigurations);
        return platformRestrictionResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchMacOsCustomAttributesAssignmentListAsync(string accessToken)
    {
        var macOsCustomAttributeScripts =
            await _deviceScriptsService.GetMacOsCustomAttributesScriptsAssignmentsListAsync(accessToken);
        if (macOsCustomAttributeScripts is null)
        {
            return null;
        }
        var macOsCustomAttributesAssignmentResults =
            await _assignmentsService.GetMacOsCustomAttributesAssignmentListAsync(accessToken, null, macOsCustomAttributeScripts);
        return macOsCustomAttributesAssignmentResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchIosLobAppProvisioningAssignmentListAsync(string accessToken)
    {
        var iosLobAppProvisioningAssignments =
            await _appsService.GetIosLobAppProvisioningAssignmentsListAsync(accessToken);
        if (iosLobAppProvisioningAssignments is null)
        {
            return null;
        }
        var iosLobAppProvisioningAssignmentResults =
            await _assignmentsService.GetIosLobAppProvisioningAssignmentListAsync(accessToken, null, iosLobAppProvisioningAssignments);
        return iosLobAppProvisioningAssignmentResults;
    }
}