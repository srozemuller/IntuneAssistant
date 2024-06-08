using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web;

namespace IntuneAssistant.Api.Controllers.Policies.Configuration;

[ApiController]
[Authorize]
[Route("v1/policies/configuration")]
public sealed class ConfigurationPolicyController : ControllerBase
{
    private readonly IConfigurationPolicyService _configurationPolicyService;
    private readonly ILogger<ConfigurationPolicyController> _logger;
    private readonly ITokenAcquisition _tokenAcquisition;
    public ConfigurationPolicyController(ILogger<ConfigurationPolicyController> logger,
        IConfigurationPolicyService configurationPolicyService, ITokenAcquisition tokenAcquisition)
    {
        _logger = logger;
        _configurationPolicyService = configurationPolicyService;
        _tokenAcquisition = tokenAcquisition;
    }

    [ProducesResponseType(201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [HttpGet(Name = "GetConfigurationPolicyList")]
    public async Task<ActionResult> Get()
    {
        string[] scopes = new []{"DeviceManagementConfiguration.Read.All"};
        var accessToken = await _tokenAcquisition.GetAccessTokenForUserAsync(scopes);
        if (!HttpContext.Request.Headers.TryGetValue("Authorization", out var extractedToken))
        {
            return Unauthorized("No Authorization Header is present. Request is not authorized");
        }
        
        _logger.LogInformation("Access token: {accessToken}", accessToken);
        
        var configurationPolicies = await _configurationPolicyService.GetConfigurationPoliciesListAsync(accessToken);
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