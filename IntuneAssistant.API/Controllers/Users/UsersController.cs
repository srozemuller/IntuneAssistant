using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web;

namespace IntuneAssistant.Api.Controllers.Groups;

[ApiController]
[Authorize]
[Route("v1/userinfo")]
public sealed class UsersController : ControllerBase
{
    private readonly IUserInformationService _userInformationService;
    private readonly ILogger<GroupMembersController> _logger;
    private readonly ITokenAcquisition _tokenAcquisition;
    public UsersController(ILogger<GroupMembersController> logger,
        ITokenAcquisition tokenAcquisition, IUserInformationService userInformationService)
    {
        _logger = logger;
        _tokenAcquisition = tokenAcquisition;
        _userInformationService = userInformationService;
    }

    [ProducesResponseType(201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [HttpPost(Name = "PostUserInfoList")]
    public async Task<ActionResult> Post(List<string> userIds)
    {
        string[] scopes = new []{"User.Read.All"};
        var accessToken = await _tokenAcquisition.GetAccessTokenForUserAsync(scopes);
        if (!HttpContext.Request.Headers.TryGetValue("Authorization", out var extractedToken))
        {
            return Unauthorized("No Authorization Header is present. Request is not authorized");
        }
        
        _logger.LogInformation("Access token: {accessToken}", accessToken);
        
        var userInfo = await _userInformationService.GetUserInformationByIdsCollectionListAsync(accessToken, userIds);
        if (userInfo is null)
        {
            return NotFound("No users found");
        }
        else
        {
            return Ok(userInfo);
        }
    }
}