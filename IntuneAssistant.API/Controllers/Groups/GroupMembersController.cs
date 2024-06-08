using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web;

namespace IntuneAssistant.Api.Controllers.Groups;

[ApiController]
[Authorize]
[Route("v1/groups/{id}/members")]
public sealed class GroupMembersController : ControllerBase
{
    private readonly IGroupInformationService _groupInformationService;
    private readonly ILogger<GroupMembersController> _logger;
    private readonly ITokenAcquisition _tokenAcquisition;
    public GroupMembersController(ILogger<GroupMembersController> logger,
        ITokenAcquisition tokenAcquisition, IGroupInformationService groupInformationService)
    {
        _logger = logger;
        _tokenAcquisition = tokenAcquisition;
        _groupInformationService = groupInformationService;
    }

    [ProducesResponseType(201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [HttpGet(Name = "GetGroupMembersList")]
    public async Task<ActionResult> Get(Guid id)
    {
        string[] scopes = new []{"Group.Read.All"};
        var accessToken = await _tokenAcquisition.GetAccessTokenForUserAsync(scopes);
        if (!HttpContext.Request.Headers.TryGetValue("Authorization", out var extractedToken))
        {
            return Unauthorized("No Authorization Header is present. Request is not authorized");
        }
        
        _logger.LogInformation("Access token: {accessToken}", accessToken);
        
        var groupMembers = await _groupInformationService.GetGroupMembersListByGroupIdAsync(accessToken, id);
        if (groupMembers is null)
        {
            return NotFound("No members found");
        }
        else
        {
            return Ok(groupMembers);
        }
    }
}