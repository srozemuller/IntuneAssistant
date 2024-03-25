
using System.IdentityModel.Tokens.Jwt;

namespace IntuneAssistant.Web.Helpers;

public static class TokenHelper
{
    public static bool TokenIsValid(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadToken(token) as JwtSecurityToken;

        if (jwtToken == null)
            return false;

        // Compare the token expiry to the current time
        return jwtToken.ValidTo.ToUniversalTime() > DateTime.UtcNow;
    }
}