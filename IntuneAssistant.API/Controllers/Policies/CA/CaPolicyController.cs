using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Interfaces.Policies.CA;
using IntuneAssistant.Models.Group;
using IntuneAssistant.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web;

namespace IntuneAssistant.Api.Controllers.Policies.CA;

[ApiController]
[Authorize]
[Route("v1/policies/ca/{id}")]
public sealed class CaPolicyController : ControllerBase
{
    private readonly ICaPolicyService _caPolicyService;
    private readonly IUserInformationService _userInformationService;
    private readonly IGroupInformationService _groupInformationService;
    private readonly ILogger<CaPolicyController> _logger;
    private readonly ITokenAcquisition _tokenAcquisition;

    public CaPolicyController(ILogger<CaPolicyController> logger,
        ICaPolicyService caPolicyService, ITokenAcquisition tokenAcquisition,
        IUserInformationService userInformationService, IGroupInformationService groupInformationService)
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
    [HttpGet(Name = "GetCaPolicy")]
    public async Task<ActionResult> Get([FromRoute] string id)
    {
        string[] scopes = new[] { "Policy.Read.All" };
        var accessToken = await _tokenAcquisition.GetAccessTokenForUserAsync(scopes);
        if (!HttpContext.Request.Headers.TryGetValue("Authorization", out var extractedToken))
        {
            return Unauthorized("No Authorization Header is present. Request is not authorized");
        }

        _logger.LogInformation("Access token: {accessToken}", accessToken);

        var policy = await _caPolicyService.GetCaPolicyByIdAsync(accessToken, Guid.Parse(id));
        _logger.LogInformation(policy.DisplayName);
        if (policy is null)
        {
            return NotFound("No conditional policies found");
        }

        if (policy.Conditions.Users.IncludeUsers.Contains("All"))
        {
            UserModel allUser = new UserModel { DisplayName = "All" };
            policy.Conditions.Users.IncludeUsersReadable = new List<UserModel> { allUser };
        }
        else
        {
            var includedUserIds = policy.Conditions.Users.IncludeUsers
                .Where(t => !string.IsNullOrEmpty(t))
                .ToList();
            var includedUsers =
                await _userInformationService.GetUserInformationByIdsCollectionListAsync(accessToken, includedUserIds);
            var displayNames = new List<UserModel>();
            foreach (var user in includedUsers.Where(u => !string.IsNullOrEmpty(u.DisplayName)))
            {
                displayNames.Add(user);
            }

            policy.Conditions.Users.IncludeUsersReadable = displayNames;
        }

        var excludedUserIds = policy.Conditions.Users.ExcludeUsers
            .Where(t => !string.IsNullOrEmpty(t))
            .ToList();
        var excludedUsers =
            await _userInformationService.GetUserInformationByIdsCollectionListAsync(accessToken, excludedUserIds);
        var excludeDisplayNames = new List<UserModel>();
        foreach (var user in excludedUsers.Where(u => !string.IsNullOrEmpty(u.DisplayName)))
        {
            excludeDisplayNames.Add(user);
        }

        policy.Conditions.Users.ExcludeUsersReadable = excludeDisplayNames;
        var includedGroupsIds = policy.Conditions.Users.IncludeGroups
            .Where(t => !string.IsNullOrEmpty(t.ToString()))
            .ToList();
        var includedGroups =
            await _groupInformationService.GetGroupInformationByIdsCollectionListAsync(accessToken, includedGroupsIds);
        policy.Conditions.Users.IncludeGroupsReadable = includedGroups;
        var excludedGroupsIds = policy.Conditions.Users.ExcludeGroups
            .Where(t => !string.IsNullOrEmpty(t.ToString()))
            .ToList();
        var excludedGroups =
            await _groupInformationService.GetGroupInformationByIdsCollectionListAsync(accessToken, excludedGroupsIds);
        policy.Conditions.Users.ExcludeGroupsReadable = excludedGroups;
        return Ok(policy);
    }
}