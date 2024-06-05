using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Services;
using IntuneAssistant.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web;

namespace IntuneAssistant.Api.Controllers.Assignments;

[ApiController]
[Authorize]
[Route("api/v1/assignments")]
public sealed class AssignmentsController : ControllerBase
{
    private readonly IConfigurationPolicyService _configurationPolicyService;
    private readonly ICompliancePoliciesService _compliancePoliciesService;
    private readonly IAppsService _appsService;
    private readonly IDeviceScriptsService _deviceScriptsService;
    private readonly IAutoPilotService _autoPilotService;
    private readonly IUpdatesService _updatesService;
    private readonly IIntentsService _intentsService;
    private readonly IAssignmentsService _assignmentsService;
    private readonly IAssignmentFiltersService _assignmentFiltersService;
    private readonly IGroupInformationService _groupInformationService;
    private readonly ILogger<AssignmentsController> _logger;
    private readonly ITokenAcquisition _tokenAcquisition;
    public AssignmentsController(
        ILogger<AssignmentsController> logger,
        IConfigurationPolicyService configurationPolicyService, 
        ITokenAcquisition tokenAcquisition, ICompliancePoliciesService compliancePoliciesService, IAppsService appsService, IDeviceScriptsService deviceScriptsService, IAutoPilotService autoPilotService, IUpdatesService updatesService, IIntentsService intentsService, IAssignmentsService assignmentsService, IAssignmentFiltersService assignmentFiltersService, IGroupInformationService groupInformationService)
    {
        _logger = logger;
        _configurationPolicyService = configurationPolicyService;
        _tokenAcquisition = tokenAcquisition;
        _compliancePoliciesService = compliancePoliciesService;
        _appsService = appsService;
        _deviceScriptsService = deviceScriptsService;
        _autoPilotService = autoPilotService;
        _updatesService = updatesService;
        _intentsService = intentsService;
        _assignmentsService = assignmentsService;
        _assignmentFiltersService = assignmentFiltersService;
        _groupInformationService = groupInformationService;
    }

    [ProducesResponseType(201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [HttpGet(Name = "GetAssignmentsList")]
    public async Task<ActionResult> Get()
    {
        string[] scopes = new[] { "DeviceManagementConfiguration.Read.All", "Group.Read.All" };
        var accessToken = await _tokenAcquisition.GetAccessTokenForUserAsync(scopes);
        if (!HttpContext.Request.Headers.TryGetValue("Authorization", out var extractedToken))
        {
            return Unauthorized("No Authorization Header is present. Request is not authorized");
        }

        _logger.LogInformation("Access token: {accessToken}", accessToken);


        var configurationPolicies = await _configurationPolicyService.GetConfigurationPoliciesListAsync(accessToken);
        var compliancePolicies = await _compliancePoliciesService.GetCompliancePoliciesListAsync(accessToken);
        var groupPolicies = await _configurationPolicyService.GetGroupPolicyConfigurationsListAsync(accessToken);
        var deviceConfigurations = await _configurationPolicyService.GetDeviceConfigurationsListAsync(accessToken);
        var deviceManagementScripts = await _deviceScriptsService.GetDeviceManagementScriptsListAsync(accessToken);
        var deviceHealthScripts = await _deviceScriptsService.GetDeviceHealthScriptsListAsync(accessToken);
        var autoPilotAssignments = await _autoPilotService.GetWindowsAutopilotDeploymentProfilesListAsync(accessToken);
        var deviceShellScripts = await _deviceScriptsService.GetDeviceShellScriptsListAsync(accessToken);
        var windowsAppProtections = await _appsService.GetWindowsManagedAppProtectionsListAsync(accessToken);
        var mobileApps = await _appsService.GetMobileAppsListAsync(accessToken);
        var appConfigurations = await _appsService.GetTargetedManagedAppConfigurationsListAsync(accessToken);
        var windowsFeatureUpdates = await _updatesService.GetWindowsFeatureUpdatesListAsync(accessToken);
        var windowsDriverUpdates = await _updatesService.GetWindowsDriversUpdatesListAsync(accessToken);
        var intents = await _intentsService.GetAllIntentsListAsync(accessToken);
        var deviceEnrollmentConfigurations =
            await _autoPilotService.GetGlobalDeviceEnrollmentForAssignmentsListAsync(accessToken);
        var macOsCustomAttributes =
            await _deviceScriptsService.GetMacOsCustomAttributesScriptsAssignmentsListAsync(accessToken);
        var iOsLobAppProvisioning = await _appsService.GetIosLobAppProvisioningAssignmentsListAsync(accessToken);
        var androidAppProtections = await _appsService.GetAndroidAppProtectionsListAsync(accessToken);
        var iosAppProtection = await _appsService.GetIosAppProtectionsListAsync(accessToken);
        var windowsAppProtection = await _appsService.GetWindowsManagedAppProtectionsListAsync(accessToken);
        var qualityUpdates = await _updatesService.GetWindowsQualityUpdatesListAsync(accessToken);

        var fetchTasks = new List<Task<List<CustomAssignmentsModel>?>>
        {
            _assignmentsService.GetConfigurationPolicyAssignmentsListAsync(accessToken, null, configurationPolicies),
            _assignmentsService.GetCompliancePoliciesAssignmentsListAsync(accessToken, null, compliancePolicies),
            _assignmentsService.GetGroupPolicyConfigurationsAssignmentsListAsync(accessToken, null, groupPolicies),
            _assignmentsService.GetDeviceConfigurationsAssignmentsListAsync(accessToken, null, deviceConfigurations),
            _assignmentsService.GetDeviceManagementScriptsAssignmentsListAsync(accessToken, null,
                deviceManagementScripts),
            _assignmentsService.GetHealthScriptsAssignmentsListAsync(accessToken, null, deviceHealthScripts),
            _assignmentsService.GetDeviceShellScriptsAssignmentsListAsync(accessToken, null, deviceShellScripts),
            _assignmentsService.GetWindowsAppProtectionAssignmentsListAsync(accessToken, null, windowsAppProtection),
            _assignmentsService.GetAutoPilotAssignmentsListAsync(accessToken, null, autoPilotAssignments),
            _assignmentsService.GetIosAppProtectionAssignmentsListAsync(accessToken, null, iosAppProtection),
            _assignmentsService.GetMobileAppAssignmentsListAsync(accessToken, null, mobileApps),
            _assignmentsService.GetAndroidAppProtectionAssignmentsListAsync(accessToken, null, androidAppProtections),
            _assignmentsService.GetTargetedAppConfigurationsAssignmentsListAsync(accessToken, null, appConfigurations),
            _assignmentsService.GetWindowsAppProtectionAssignmentsListAsync(accessToken, null, windowsAppProtections),
            _assignmentsService.GetWindowsFeatureUpdatesAssignmentsListAsync(accessToken, null, windowsFeatureUpdates),
            _assignmentsService.GetWindowsDriverUpdatesAssignmentsListAsync(accessToken, null, windowsDriverUpdates),
            _assignmentsService.GetIntentsAssignmentListAsync(accessToken, null, intents),
            _assignmentsService.GetDeviceEnrollmentAssignmentListAsync(accessToken, null,
                deviceEnrollmentConfigurations),
            _assignmentsService.GetMacOsCustomAttributesAssignmentListAsync(accessToken, null, macOsCustomAttributes),
            _assignmentsService.GetIosLobAppProvisioningAssignmentListAsync(accessToken, null, iOsLobAppProvisioning),
            _assignmentsService.GetWindowsQualityUpdatesAssignmentsListAsync(accessToken, null, qualityUpdates)
        };

        var results = await Task.WhenAll(fetchTasks);
        var allResults = new List<CustomAssignmentsModel>();
        List<CustomAssignmentsModel> returnResults = new List<CustomAssignmentsModel>();
        foreach (var result in results)
        {
            if (result != null) allResults.AddRange(result);
        }

        if (allResults.Count > 0)
        {
            var allFiltersInfo = await _assignmentFiltersService.GetAssignmentFiltersListAsync(accessToken);

            var uniqueGroupIds = results
                .Where(r => r != null)
                .SelectMany(r => r)
                .Where(t => !string.IsNullOrEmpty(t.TargetId))
                .Select(t => t.TargetId)
                .ToList();

            var allGroupsInfo =
                await _groupInformationService.GetGroupInformationByIdsCollectionListAsync(accessToken,
                    uniqueGroupIds);

            foreach (var result in allResults)
            {
                Console.WriteLine(result.ToString());
                var filterInfo = allFiltersInfo?.Find(g => g?.Id == result.FilterId);
                var filterName = filterInfo?.DisplayName ?? "No filter";

                var target = allGroupsInfo.Find(g => g.Id == result.TargetId);
                string targetFriendly = target?.DisplayName ?? "-";
                result.TargetName = targetFriendly;
                result.FilterId = filterName;
                returnResults.Add(result);
            }
        }
        return Ok(returnResults);
    }
}