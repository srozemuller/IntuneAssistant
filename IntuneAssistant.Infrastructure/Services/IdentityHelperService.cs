using System.Diagnostics;
using Azure.Identity;
using CommandConfiguration;
using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.Graph.Beta;
using Microsoft.Identity.Client;
using Microsoft.Identity.Client.Extensions.Msal;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class IdentityHelperService : IIdentityHelperService
{
    //private static readonly string[] Scopes = { "https://graph.microsoft.com//.default" };

    /// <summary>
    /// Gets a default client application based on the configuration in the appsettings.json file.
    /// </summary>
    /// <returns>A default client application based on the configuration in the appsettings.json file.</returns>
    /// <exception cref="InvalidOperationException">Thrown when the appsettings.json file is missing a required configuration value.</exception>
    public async Task<IPublicClientApplication> GetDefaultClientApplication()
    {
        var storageProperties = new StorageCreationPropertiesBuilder(
                AppConfiguration.CACHE_FILE_NAME,
    AppConfiguration.CacheDir)
            .WithLinuxKeyring(
                AppConfiguration.LINUX_KEY_RING_SCHEMA,
                AppConfiguration.LINUX_KEY_RING_COLLECTION,
                AppConfiguration.LINUX_KEY_RING_LABEL,
        AppConfiguration.LinuxKeyRingAttr1,
        AppConfiguration.LinuxKeyRingAttr2)
            .WithMacKeyChain(
                AppConfiguration.KEY_CHAIN_SERVICE_NAME,
                AppConfiguration.KEY_CHAIN_ACCOUNT_NAME)
            .Build();

        var pcaOptions = new PublicClientApplicationOptions
        {
            ClientId = AppConfiguration.CLIENT_ID,
            RedirectUri = AppConfiguration.REDIRECT_URI,
        };

        var pca = PublicClientApplicationBuilder
            .CreateWithApplicationOptions(pcaOptions)
            .WithAuthority(AppConfiguration.AUTHORITY)
            .WithRedirectUri(AppConfiguration.REDIRECT_URI)
            .Build();

        var cacheHelper = await MsalCacheHelper.CreateAsync(storageProperties);
        cacheHelper.RegisterCache(pca.UserTokenCache);

        return pca;
    }

    /// <summary>
    /// Gets an access token silently or interactively.
    /// </summary>
    /// <returns>An access token or null.</returns>
    public async Task<string> GetAccessTokenSilentOrInteractiveAsync()
    {
        AuthenticationResult? result = null;

        var app = await GetDefaultClientApplication();
        var accounts = await app.GetAccountsAsync();

        try
        {
            result = await app.AcquireTokenSilent(AppConfiguration.GRAPH_INTERACTIVE_SCOPE, accounts.FirstOrDefault())
                .ExecuteAsync();
        }
        catch (MsalUiRequiredException ex)
        {
            // A MsalUiRequiredException happened on AcquireTokenSilent.
            // This indicates you need to call AcquireTokenInteractive to acquire a token
            Debug.WriteLine($"MsalUiRequiredException: {ex.Message}");

            try
            {
                result = await app.AcquireTokenInteractive(AppConfiguration.GRAPH_INTERACTIVE_SCOPE).ExecuteAsync();
            }
            catch (MsalException msalException)
            {
                Debug.WriteLine("An exception has occurred while acquiring a token interactively");
                Debug.WriteLine($"MsalException: {msalException.Message}");
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine("An exception has occurred while acquiring a token silently");
            Debug.WriteLine($"Exception: {ex.Message}");
        }

        return result?.AccessToken;
    }

    public async Task<string?> GetAccessTokenWithClientCredential(string? tenantId, string? clientId, string? clientSecret)
    {
        // TODO: Remove
        var scopes = new[] { "https://graph.microsoft.com/.default" };
        var options = new ClientSecretCredentialOptions
        {
            AuthorityHost = AzureAuthorityHosts.AzurePublicCloud,
        };

        var clientSecretCredential = new ClientSecretCredential(tenantId, clientId, clientSecret, options);
        var graphClient = new GraphServiceClient(clientSecretCredential, scopes);
        await graphClient.Applications.GetAsync();
        var token = await clientSecretCredential.GetTokenAsync(new Azure.Core.TokenRequestContext(scopes));

        return token.Token;
    }

    /// <summary>
    /// Iterates over all accounts and removes them from the cache.
    /// </summary>
    /// <returns>The number of removed accounts or -1 if an exception occurred.</returns>
    public async Task<int> LogoutAsync()
    {
        try
        {
            var app = await GetDefaultClientApplication();
            var accounts = await app.GetAccountsAsync();
            var accountList = accounts.ToList();

            while (accountList.Any())
            {
                await app.RemoveAsync(accountList.FirstOrDefault());
                accounts = await app.GetAccountsAsync();
                accountList = accounts.ToList();
            }

            return accountList.Count;
        }
        catch (Exception)
        {
            return -1;
        }
    }
}
