using Azure.Identity;
using IntuneAssistant.Constants;
using IntuneAssistant.Helpers;
using Microsoft.Graph.Beta;
using IntuneAssistant.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Identity.Client;

namespace IntuneAssistant.Services;

public sealed class LoginService : ILoginService
{

    private readonly ILogger<LoginService> _logger;

    public LoginService(ILogger<LoginService> logger)
    {
        _logger = logger;
    }

    public async Task LoginWithDeviceCode()
    {
        
        var scopes = new[] { "https://graph.microsoft.com/.default" };
        var tenantId = "common";
        var clientId = CoreInfo.GraphPowerShellApp;


        var options = new DeviceCodeCredentialOptions
        {
            AuthorityHost = AzureAuthorityHosts.AzurePublicCloud,
            ClientId = clientId,
            TenantId = tenantId,
            DeviceCodeCallback = (code, cancellation) =>
            {
                Console.WriteLine(code.Message);
                return Task.FromResult(0);
            },
        };
        
        var deviceCodeCredential = new DeviceCodeCredential(options);

        var graphClient = new GraphServiceClient(deviceCodeCredential, scopes);
        await graphClient.Me
            .GetAsync();
        
    }

    public async Task LoginInterActive()
    {
        var scopes = new[] { "https://graph.microsoft.com/.default" };
        var tenantId = "common";
        var clientId = CoreInfo.GraphPowerShellApp;

        var options = new InteractiveBrowserCredentialOptions
        {
            TenantId = tenantId,
            ClientId = clientId,
            AuthorityHost = AzureAuthorityHosts.AzurePublicCloud,
            RedirectUri = new Uri("http://localhost"),
        };

        // https://learn.microsoft.com/dotnet/api/azure.identity.interactivebrowsercredential
        var interactiveCredential = new InteractiveBrowserCredential(options);  //InteractiveBrowserCredential(options);

        var graphClient = new GraphServiceClient(interactiveCredential, scopes);
        await graphClient.Me
            .GetAsync();
        Console.WriteLine($"Welcome {graphClient.Me.GetAsync().Result.DisplayName}");
    }

    public async Task LoginWithClientCredential(string tenantId, string clientId, string clientSecret)
    {
        var scopes = new[] { "https://graph.microsoft.com/.default" };
        var options = new ClientSecretCredentialOptions
        {
            AuthorityHost = AzureAuthorityHosts.AzurePublicCloud,
        };

// https://learn.microsoft.com/dotnet/api/azure.identity.clientsecretcredential
        var clientSecretCredential = new ClientSecretCredential(
            tenantId, clientId, clientSecret, options);
        var graphClient = new GraphServiceClient(clientSecretCredential, scopes);
        await graphClient.Applications.GetAsync();
        var accessToken = await clientSecretCredential.GetTokenAsync(new Azure.Core.TokenRequestContext(scopes) { });
        Console.WriteLine($"Access Granted token is {accessToken.Token}");

    }
    
    public AuthenticationResult GetTokenFromCache()
    {
        _logger.LogWarning("This starts the cache crawling");
        var pca = IdentityHelper.GetDefaultClientApplication();
        var cacheHelper = IdentityHelper.CreateCacheHelperAsync().Result;
        cacheHelper.RegisterCache(pca.UserTokenCache);

        var accounts = pca.GetAccountsAsync().Result.ToList();
        var firstAccount = accounts.FirstOrDefault();

        if (firstAccount is null)
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("There is no account in the cache");
            Console.ResetColor();
        }

        try
        {
            return pca
                .AcquireTokenSilent(IdentityConfiguration.Scopes, firstAccount)
                .ExecuteAsync().Result;
             
        }
        catch (MsalUiRequiredException)
        {
            _logger.LogWarning("There is no token!");
            LoginInterActive();    
        }

        return null;
    }
}