using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Interfaces.Policies.CA;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web;

namespace IntuneAssistant.Api.Controllers.Policies.CA;

[ApiController]
[Authorize]
[Route("v1/policies/ca")]
public sealed class CaPolicyController : ControllerBase
{
    private readonly ICaPolicyService _caPolicyService;
    private readonly IUserInformationService _userInformationService;
    private readonly IGroupInformationService _groupInformationService;
    private readonly ILogger<CaPolicyController> _logger;
    private readonly ITokenAcquisition _tokenAcquisition;
    public CaPolicyController(ILogger<CaPolicyController> logger,
        ICaPolicyService caPolicyService, ITokenAcquisition tokenAcquisition, IUserInformationService userInformationService, IGroupInformationService groupInformationService)
    {
        _logger = logger;
        _caPolicyService = caPolicyService;
        _tokenAcquisition = tokenAcquisition;
        _userInformationService = userInformationService;
        _groupInformationService = groupInformationService;
    }

    [ProducesResponseType(201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [HttpGet(Name = "PostCaPolicyList")]
    public async Task<ActionResult> Get()
    {
        string[] scopes = new []{"Policy.Read.All"};
        var accessToken = await _tokenAcquisition.GetAccessTokenForUserAsync(scopes);
        if (!HttpContext.Request.Headers.TryGetValue("Authorization", out var extractedToken))
        {
            return Unauthorized("No Authorization Header is present. Request is not authorized");
        }
        
        _logger.LogInformation("Access token: {accessToken}", accessToken);
        
        var caPolicies = await _caPolicyService.GetCaPoliciesListAsync(accessToken);
        if (caPolicies is null)
        {
            return NotFound("No conditional policies found");
        }
        else
        {
            foreach (var policy in caPolicies)
            {
                if (policy.Conditions.Users.IncludeUsers.Contains("All"))
                {
                    policy.Conditions.Users.IncludeUsersReadable = new List<string> { "All" };
                }
                else
                {
                    var includedUserIds = policy.Conditions.Users.IncludeUsers
                    .Where(t => !string.IsNullOrEmpty(t))
                    .ToList();
                    var includedUsers = await _userInformationService.GetUserInformationByIdsCollectionListAsync(accessToken, includedUserIds);
                    var displayNames = new List<string>();
                    foreach (var user in includedUsers.Where(u => !string.IsNullOrEmpty(u.DisplayName)))
                    {
                        displayNames.Add(user.DisplayName);
                    }
                    policy.Conditions.Users.IncludeUsersReadable = displayNames;
                }
                
                var excludedUserIds = policy.Conditions.Users.ExcludeUsers
                    .Where(t => !string.IsNullOrEmpty(t))
                    .ToList();
                var excludedUsers = await _userInformationService.GetUserInformationByIdsCollectionListAsync(accessToken, excludedUserIds);
                var excludeDisplayNames = new List<string>();
                foreach (var user in excludedUsers.Where(u => !string.IsNullOrEmpty(u.DisplayName)))
                {
                    excludeDisplayNames.Add(user.DisplayName);
                }
                policy.Conditions.Users.ExcludeUsersReadable = excludeDisplayNames;
                var excludedGroupsIds = policy.Conditions.Users.ExcludeGroups
                    .Where(t => !string.IsNullOrEmpty(t.ToString()))
                    .ToList();
                var excludedGroups = await _groupInformationService.GetGroupInformationByIdsCollectionListAsync(accessToken, excludedGroupsIds);
                var excludeGroupNames = new List<string>();
                foreach (var group in excludedGroups.Where(u => !string.IsNullOrEmpty(u.DisplayName)))
                {
                    excludeGroupNames.Add(group.DisplayName);
                }
                policy.Conditions.Users.ExcludeGroupsReadable = excludeGroupNames;
            }
            return Ok(caPolicies);
        }
    }
}