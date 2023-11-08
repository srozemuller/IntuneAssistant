using Microsoft.Identity.Client;

namespace IntuneAssistant.Interfaces;

public interface ILoginService
{
    Task LoginWithDeviceCode();
    Task LoginInterActive();
    Task LoginWithClientCredential(string tenantId, string clientId, string clientSecret);

    AuthenticationResult GetTokenFromCache();
}
