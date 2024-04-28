using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.AspNetCore.Mvc;


namespace IntuneAssistant.API.Controllers;

[ApiController]
[Route("/api/v1/configuration-policies")]
public class ConfigurationPolicyController : ControllerBase
{
    private readonly IConfigurationPolicyService _configurationPolicyService;
    private readonly ILogger<ConfigurationPolicyController> _logger;
    
    public ConfigurationPolicyController(IConfigurationPolicyService configurationPolicyService, ILogger<ConfigurationPolicyController> logger)
    {
        _configurationPolicyService = configurationPolicyService;
        _logger = logger;
    }

    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    [HttpGet("{policyId:guid}", Name = "GetCaPolicy")]
    public async Task<ActionResult<ConfigurationPolicyModel>> Get(Guid policyId)
    {
        // Get the access token from the Authorization header
        var accessToken = Request.Headers["Authorization"].ToString().Split(' ')[1];
        _logger.LogInformation("Fetching CaPolicy with ReferenceId {PolicyRefId}", policyId.ToString());
        var policyDetail = await _configurationPolicyService.GetConfigurationPoliciesListAsync(accessToken);

        if (policyDetail is null)
            return NotFound();

        return Ok(policyDetail);
    }
}