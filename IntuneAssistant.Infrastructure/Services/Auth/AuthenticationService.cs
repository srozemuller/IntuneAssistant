using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace IntuneAssistant.Infrastructure.Services.Auth;

public interface IAuthenticationService
{
    string Authenticate(string entraId, string role);
}

public class AuthenticationService : IAuthenticationService
{
    private readonly IConfiguration _configuration;

    public AuthenticationService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string Authenticate(string entraId, string role)
    {
        // Here you should validate the entraId and role
        // For now, let's assume they are valid

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration.GetSection("Jwt:Key").Value);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] 
            {
                new Claim(ClaimTypes.Name, entraId),
                new Claim(ClaimTypes.Role, role)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}