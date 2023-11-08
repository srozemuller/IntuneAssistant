using Microsoft.Identity.Client;
using Microsoft.Identity.Client.Extensions.Msal;
using IntuneAssistant.Constants;
namespace IntuneAssistant.Helpers;

public static class IdentityHelper
{
    public static IPublicClientApplication GetDefaultClientApplication()
    {
        var pcaOptions = new PublicClientApplicationOptions
        {
            ClientId = CoreInfo.GraphPowerShellApp,
            RedirectUri = "http://localhost"
        };

        var pca = PublicClientApplicationBuilder
            .CreateWithApplicationOptions(pcaOptions)
            .WithAuthority(IdentityConfiguration.Authority)
            .WithRedirectUri("http://localhost")
            .Build();

        return pca;
    }

    public static async Task<MsalCacheHelper> CreateCacheHelperAsync()
    {
        StorageCreationProperties storageProperties;
        MsalCacheHelper cacheHelper;
        try
        {
            storageProperties = ConfigureSecureStorage(usePlaintextFileOnLinux: false);
            cacheHelper = await MsalCacheHelper.CreateAsync(
                    storageProperties)
                .ConfigureAwait(false);

            // the underlying persistence mechanism might not be usable
            // this typically happens on Linux over SSH
            cacheHelper.VerifyPersistence();

            return cacheHelper;
        }
        catch (MsalCachePersistenceException ex)
        {
            Console.WriteLine("Cannot persist data securely. ");
            Console.WriteLine("Details: " + ex);

            if (!SharedUtilities.IsLinuxPlatform()) throw;

            storageProperties = ConfigureSecureStorage(usePlaintextFileOnLinux: true);

            Console.WriteLine($"Falling back on using a plaintext " +
                              $"file located at {storageProperties.CacheFilePath} Users are responsible for securing this file!");

            cacheHelper = await MsalCacheHelper.CreateAsync(
                    storageProperties)
                .ConfigureAwait(false);

            return cacheHelper;
        }
    }

    private static StorageCreationProperties ConfigureSecureStorage(bool usePlaintextFileOnLinux)
    {
        if (!usePlaintextFileOnLinux)
        {
            return new StorageCreationPropertiesBuilder(
                    IdentityConfiguration.CacheFileName,
                    IdentityConfiguration.CacheDir)
                .WithLinuxKeyring(
                    IdentityConfiguration.LinuxKeyRingSchema,
                    IdentityConfiguration.LinuxKeyRingCollection,
                    IdentityConfiguration.LinuxKeyRingLabel,
                    IdentityConfiguration.LinuxKeyRingAttr1,
                    IdentityConfiguration.LinuxKeyRingAttr2)
                .WithMacKeyChain(
                    IdentityConfiguration.KeyChainServiceName,
                    IdentityConfiguration.KeyChainAccountName)
                .Build();
        }

        return new StorageCreationPropertiesBuilder(
                IdentityConfiguration.CacheFileName + "plaintext", // do not use the same file name so as not to overwrite the encypted version
                IdentityConfiguration.CacheDir)
            .WithLinuxUnprotectedFile()
            .WithMacKeyChain(
                IdentityConfiguration.KeyChainServiceName,
                IdentityConfiguration.KeyChainAccountName)
            .Build();
    }
}
