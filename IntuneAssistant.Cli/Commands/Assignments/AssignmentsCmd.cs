using System.CommandLine;
using System.Text;
using IntuneAssistant.Constants;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using IntuneAssistant.Extensions;
using IntuneAssistant.Extensions.HTML;
using Microsoft.Graph.Beta.Models;
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
        var exportCsvProvided = !string.IsNullOrWhiteSpace(options.ExportCsv);
        var pageSizeProvided = !string.IsNullOrEmpty(options.PageSize);
        var pageSize = AppConfiguration.TABLE_PAGESIZE;
        var allFiltersInfo = new List<DeviceAndAppManagementAssignmentFilter>();
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
            FetchDiskEncryptionAssignmentsListAsync(accessToken),
            FetchUpdatePoliciesForMacAssignmentsListAsync(accessToken),
            FetchPlatformScriptAssignmentsListAsync(accessToken),
            FetchManagedAppPolicyAssignmentListAsync(accessToken),
            FetchDeviceEnrollmentRestrictionsAssignmentListAsync(accessToken),
            FetchDeviceLimitRestrictionsAssignmentListAsync(accessToken),
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
                        allResults.AddRange(result);
                    }
                });
        if (allResults.Count > 0)
        {
            allFiltersInfo =
                await _assignmentFiltersService.GetAssignmentFiltersListAsync(accessToken);
            foreach (var result in allResults)
            {
                var filterInfo = allFiltersInfo?.Find(g => g?.Id == result.FilterId);
                result.FilterId = filterInfo?.DisplayName ?? "No filter";
            }
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
                bodySb.Append(HtmlTemplateHelper.GenerateAssignmentsOverview(allResults));

                var htmlTemplate =
                    HtmlTemplateHelper.CreateHtmlPage(_identityHelperService.GetCurrentUserContext().Result.FirstOrDefault().HomeAccountId.TenantId,
                        bodySb.ToString());
                File.WriteAllText("report.html",htmlTemplate);
                break;
        }
        
        var selectedColumns = new List<string> { "ResourceType","ResourceName", "ResourceId","AssignmentType","FilterId","FilterType" };
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
                item.ResourceType,
                item.ResourceName.EscapeMarkup(),
                item.ResourceId,
                item.AssignmentType,
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
    private async Task<List<CustomAssignmentsModel>?> FetchUpdatePoliciesForMacAssignmentsListAsync(string accessToken)
    {
        var updatesForMacResults =
            await _assignmentsService.GetUpdatesForMacAssignmentListAsync(accessToken, null);
        return updatesForMacResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchPlatformScriptAssignmentsListAsync(string accessToken)
    {
        var updatesForMacResults =
            await _assignmentsService.GetPlatformScriptsAssignmentListAsync(accessToken, null);
        return updatesForMacResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchManagedAppPolicyAssignmentListAsync(string accessToken)
    {
        var managedAppResults =
            await _assignmentsService.GetManagedApplicationAssignmentListAsync(accessToken, null);
        return managedAppResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchDeviceEnrollmentRestrictionsAssignmentListAsync(string accessToken)
    {
        var platformRestrictionResults =
            await _assignmentsService.GetDevicePlatformRestrictionsAssignmentListAsync(accessToken, null);
        return platformRestrictionResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchDeviceLimitRestrictionsAssignmentListAsync(string accessToken)
    {
        var limitRestrictionResults =
            await _assignmentsService.GetDeviceLimitRestrictionsAssignmentListAsync(accessToken, null);
        return limitRestrictionResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchMacOsCustomAttributesAssignmentListAsync(string accessToken)
    {
        var macOsCustomAttributesAssignmentResults =
            await _assignmentsService.GetMacOsCustomAttributesAssignmentListAsync(accessToken, null);
        return macOsCustomAttributesAssignmentResults;
    }
    private async Task<List<CustomAssignmentsModel>?> FetchIosLobAppProvisioningAssignmentListAsync(string accessToken)
    {
        var iosLobAppProvisioningAssignmentResults =
            await _assignmentsService.GetIosLobAppProvisioningAssignmentListAsync(accessToken, null);
        return iosLobAppProvisioningAssignmentResults;
    }
}
