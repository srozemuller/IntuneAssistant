using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web;

namespace IntuneAssistant.Api.Controllers.Policies.Configuration;

[ApiController]
[Authorize]
[Route("v1/policies/configuration/settings")]
public sealed class ConfigurationPolicySettingsController : ControllerBase
{
    private readonly IConfigurationPolicyService _configurationPolicyService;
    private readonly ILogger<ConfigurationPolicyController> _logger;
    private readonly ITokenAcquisition _tokenAcquisition;
    public ConfigurationPolicySettingsController(ILogger<ConfigurationPolicyController> logger,
        IConfigurationPolicyService configurationPolicyService, ITokenAcquisition tokenAcquisition)
    {
        _logger = logger;
        _configurationPolicyService = configurationPolicyService;
        _tokenAcquisition = tokenAcquisition;
    }

    [ProducesResponseType(201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [HttpPost(Name = "PostConfigurationPolicyList")]
    public async Task<ActionResult> Post([FromBody] List<ConfigurationPolicyModel> configPolicies)
    {
        string[] scopes = new []{"DeviceManagementConfiguration.Read.All"};
        var accessToken = await _tokenAcquisition.GetAccessTokenForUserAsync(scopes);
        var settingsOverview = new List<CustomPolicySettingsModel>();
        if (!HttpContext.Request.Headers.TryGetValue("Authorization", out var extractedToken))
        {
            return Unauthorized("No Authorization Header is present. Request is not authorized");
        }
        
        _logger.LogInformation("Access token: {accessToken}", accessToken);
        
        var configurationPolicies = await _configurationPolicyService.GetConfigurationPoliciesSettingsListAsync(accessToken, configPolicies);
        if (configurationPolicies is null)
        {
            return NotFound("No configuration policies found");
        }
        else
        {
            foreach (var setting in configurationPolicies)
            {
                var settingName = setting.SettingName;
                var settingValue = setting.SettingValue;
                settingsOverview.Add(new CustomPolicySettingsModel
                {
                    PolicyName = setting.PolicyName,
                    SettingName = settingName,
                    SettingValue = settingValue,
                    ChildSettingInfo = setting.ChildSettingInfo
                });
            }
            return Ok(settingsOverview);
        }
    }
}