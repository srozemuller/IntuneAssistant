using Microsoft.Graph.Beta;
using Microsoft.Kiota.Abstractions.Authentication;

namespace IntuneAssistant.Infrastructure;

public class TokenProvider : IAccessTokenProvider
{
    public string? Token { get; set; }

    public Task<string?> GetAuthorizationTokenAsync(Uri uri, Dictionary<string, object> additionalAuthenticationContext = null, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Token);
    }

    public AllowedHostsValidator AllowedHostsValidator { get; }
}

public class GraphClient
{
    private readonly TokenProvider _tokenProvider;

    public GraphClient(string? accessToken)
    {
        _tokenProvider = new TokenProvider { Token = accessToken };
    }

    public GraphServiceClient GetAuthenticatedGraphClient()
    {
        var authenticationProvider = new BaseBearerTokenAuthenticationProvider(_tokenProvider);
        var graphClient = new GraphServiceClient(authenticationProvider);
        return graphClient;
    }
}
