using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web;

namespace IntuneAssistant.Api.Controllers.Groups;

[ApiController]
[Authorize]
[Route("v1/groupsinfo")]
public sealed class GroupsController : ControllerBase
{
    private readonly IGroupInformationService _groupInformationService;
    private readonly ILogger<GroupsController> _logger;
    private readonly ITokenAcquisition _tokenAcquisition;
    public GroupsController(ILogger<GroupsController> logger,
        ITokenAcquisition tokenAcquisition, IGroupInformationService groupInformationService)
    {
        _logger = logger;
        _tokenAcquisition = tokenAcquisition;
        _groupInformationService = groupInformationService;
    }

    [ProducesResponseType(201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [HttpPost(Name = "PostGroupInfoList")]
    public async Task<ActionResult> Post(List<string> groupIds)
    {
        string[] scopes = new []{"Group.Read.All"};
        var accessToken = await _tokenAcquisition.GetAccessTokenForUserAsync(scopes);
        if (!HttpContext.Request.Headers.TryGetValue("Authorization", out var extractedToken))
        {
            return Unauthorized("No Authorization Header is present. Request is not authorized");
        }
        
        _logger.LogInformation("Access token: {accessToken}", accessToken);
        
        var groupInfo = await _groupInformationService.GetGroupInformationByIdsCollectionListAsync(accessToken, groupIds);
        if (groupInfo is null)
        {
            return NotFound("No groups found");
        }
        else
        {
            return Ok(groupInfo);
        }
    }
}