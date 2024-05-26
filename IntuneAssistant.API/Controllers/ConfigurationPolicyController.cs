using Microsoft.AspNetCore.Mvc;
using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.AspNetCore.Authorization;


namespace IntuneAssistant.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/policies/configuration")]
public sealed class ConfigurationPolicyController : ControllerBase
{
    private readonly IConfigurationPolicyService _configurationPolicyService;
    private readonly ILogger<ConfigurationPolicyController> _logger;

    public ConfigurationPolicyController(ILogger<ConfigurationPolicyController> logger,
        IConfigurationPolicyService configurationPolicyService)
    {
        _logger = logger;
        _configurationPolicyService = configurationPolicyService;
    }

    [ProducesResponseType(201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [HttpGet(Name = "GetConfigurationPolicyList")]
    public async Task<ActionResult> Get()
    {
        var userClaims = HttpContext.User.Claims;
        // Use the userClaims to authorize the user's actions

        if (!HttpContext.Request.Headers.TryGetValue("Authorization", out var extractedToken))
        {
            return Unauthorized("No Authorization Header is present. Request is not authorized");
        }

        var accessToken = extractedToken.ToString().Substring("Bearer ".Length).Trim();
        _logger.LogInformation("Access token: {accessToken}", accessToken);
        
        var configurationPolicies = await _configurationPolicyService.GetDeviceConfigurationsListAsync(accessToken);
        if (configurationPolicies is null)
        {
            return NotFound("No configuration policies found");
        }
        else
        {
            return Ok(configurationPolicies);
        }
    }
}