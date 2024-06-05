using Microsoft.Identity.Client;

namespace IntuneAssistant.Infrastructure.Auth;

public interface ITokenExchangeService
{
    Task<string> GetTokenOnBehalfOfAsync(string userAccessToken);
}

public class TokenExchangeService : ITokenExchangeService
{
    private readonly IConfidentialClientApplication _confidentialClientApplication;

    public TokenExchangeService(IConfidentialClientApplication confidentialClientApplication)
    {
        _confidentialClientApplication = confidentialClientApplication;
    }

    public async Task<string> GetTokenOnBehalfOfAsync(string userAccessToken)
    {
        var userAssertion = new UserAssertion(userAccessToken);

        var result = await _confidentialClientApplication
            .AcquireTokenOnBehalfOf(new[] { "https://graph.microsoft.com/.default" }, userAssertion)
            .ExecuteAsync();
        // Print the token to the console
        Console.WriteLine($"Exchanged token: {result.AccessToken}");

        return result.AccessToken;
    }
}