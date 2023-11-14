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

    // show
    public const string ShowCommandName = "show";
    public const string ShowCommandDescription = "Give you all show options";
    
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
    
    // policies
    public const string PoliciesCommandName = "policies";
    public const string PoliciesCommandDescription = "Retrieve a list of all policies from Intune";
    public const string PolicyIdArg = "--id";
    public const string PolicyIdArgDescription = "Enter the policy ID to retreive specific policy information";

    // configuration policies
    public const string ConfigurationPolicyCommandName = "configuration";
    public const string ConfigurationPolicyCommandDescription = "Retrieve a list of all configuration policies from Intune";
    
    // compliance policies
    public const string CompliancePolicyCommandName = "compliance";
    public const string CompliantPolicyCommandDescription = "Retrieve a list of all comppliance policies from Intune";    
   
    // assignments 
    public const string AssignmentsArg = "--assignments"; 
    public const string AssignmentsArgDescription = "Shows the assignement of the specific item in Intune"; 

    // device status
    public const string DeviceStatusCommandName = "--device-status";
    public const string DeviceStatusCommandDescription = "Shows the devices statusses in the policy";

    // arguments
    public const string ExportCsvArg = "--export-csv";
    public const string ExportCsvArgDescription = "Exports the content to a csv file";
    public const string RemoveArg = "--remove";
    public const string RemoveArgDescription = "Removes all duplicate devices from Intune";
    public const string NonAssignedArg = "--non-assigned"; 
    public const string NonAssignedArgDescription = "Retrieve a list of all non-assigned compliance policies from Intune";
}
