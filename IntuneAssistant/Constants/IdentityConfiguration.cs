using Microsoft.Identity.Client.Extensions.Msal;

namespace IntuneAssistant.Constants;

public class IdentityConfiguration
{
    // App settings
    public static readonly string[] Scopes = Permissions.RequiredScopes;

    // Use "common" if you want to allow any "enterprise" (work or school) account AND any user account (live.com, outlook, hotmail) to log in.
    // Use an actual tenant ID to allow only your enterprise to log in.
    // Use "organizations" to allow only enterprise log-in, this is required for the Username / Password flow
    public const string Authority = "https://login.microsoftonline.com/common";
    public const string ClientId = CoreInfo.GraphPowerShellApp;

    // Cache settings
    public const string CacheFileName = "myapp_msal_cache.txt";
    public readonly static string CacheDir = MsalCacheHelper.UserRootDirectory;

    public const string KeyChainServiceName = "myapp_msal_service";
    public const string KeyChainAccountName = "myapp_msal_account";

    public const string LinuxKeyRingSchema = "com.contoso.devtools.tokencache";
    public const string LinuxKeyRingCollection = MsalCacheHelper.LinuxKeyRingDefaultCollection;
    public const string LinuxKeyRingLabel = "MSAL token cache for all Contoso dev tool apps.";
    public static readonly KeyValuePair<string, string> LinuxKeyRingAttr1 = new KeyValuePair<string, string>("Version", "1");
    public static readonly KeyValuePair<string, string> LinuxKeyRingAttr2 = new KeyValuePair<string, string>("ProductGroup", "MyApps");
}
