namespace IntuneAssistant.Cli;

public static class CommandConfiguration
{
    // auth
    public const string AuthCommandName = "auth";
    public const string AuthCommandDescription = "Authentication options";

    // auth login
    public const string AuthLoginCommandName = "login";
    public const string AuthLoginCommandDescription = "Authenticate with Azure AD";

    // auth logout
    public const string AuthLogoutCommandName = "logout";
    public const string AuthLogoutCommandDescription = "Logout of Azure AD";

    // devices
    public const string DevicesCommandName = "devices";
    public const string DevicesCommandDescription = "Retrieve a list of all devices from Intune";
    public const string DevicesWindowsFilterName = "--include-windows";
    public const string DevicesWindowsFilterDescription = "Retrieves all Windows devices from Intune";
    public const string DevicesMacOsFilterName = "--include-macos";
    public const string DevicesMacOsFilterDescription = "Retrieves all macOs devices from Intune";
    public const string DevicesIosFilterName = "--include-ios";
    public const string DevicesIosFilterDescription = "Retrieves all iOS devices from Intune";
    public const string DevicesAndroidFilterName = "--include-android";
    public const string DevicesAndroidFilterDescription = "Retrieves all Android devices from Intune";
    public const string DevicesNonCompliantFilterName = "--select-non-compliant";
    public const string DevicesNonCompliantFilterDescription = "Retrieves all non-compliant devices from Intune";

    // devices duplicates
    public const string DevicesDuplicatesCommandName = "duplicates";
    public const string DevicesDuplicatesCommandDescription = "Retrieve a list of all duplicate devices from Intune";

    // arguments
    public const string ExportCsvArg = "--export-csv";
    public const string ExportCsvArgDescription = "Exports the list to a csv file";
    public const string RemoveArg = "--remove";
    public const string RemoveArgDescription = "Removes all duplicate devices from Intune";
}
