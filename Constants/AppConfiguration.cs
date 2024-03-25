using IntuneAssistant.Enums;
using Microsoft.Identity.Client.Extensions.Msal;

namespace IntuneAssistant.Constants;

public static class WebAppConfiguration
{
    // Web App settings
    public const string LOGIN_URL = "/authentication/login";
    public static readonly string[] GRAPH_INTERACTIVE_SCOPE = {
        "Group.Read.All",
        "Directory.Read.All",
        "DeviceManagementConfiguration.ReadWrite.All",
        "DeviceManagementServiceConfig.ReadWrite.All",
        "DeviceManagementApps.ReadWrite.All",
        "DeviceManagementRBAC.Read.All"
    };
    
   
}
