using Microsoft.Graph.Beta.Models;
using Microsoft.Identity.Client;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IIdentityHelperService
{
    Task<IPublicClientApplication> GetDefaultClientApplication();
    Task<string?> GetAccessTokenSilentOrInteractiveAsync();
    Task<string?> GetAccessTokenWithClientCredential(string? tenantId, string? clientId, string? clientSecret);
    Task LogoutAsync();

    Task<List<IAccount>> GetCurrentUserContext();
}
