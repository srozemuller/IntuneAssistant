using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;

namespace IntuneAssistant.Api.Controllers
{
    [ApiController]
    [Route("api/v1/userinfo")]
    public class UserInfoController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetUserInfo()
        {
            var userClaims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            var userRoles = User.Claims.Where(c => c.Type == "role").Select(c => c.Value).ToList();
            var accessToken = string.Empty;

            if (HttpContext.Request.Headers.TryGetValue("Authorization", out var extractedToken))
            {
                accessToken = extractedToken.ToString().Substring("Bearer ".Length).Trim();
            }

            return Ok(new { userClaims, userRoles, accessToken });
        }
    }
}