using System.Globalization;

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
    public const string PoliciesConfigurationFilterName = "--include-configuration";
    public const string PoliciesConfigurationFilterDescription = "Retrieves all configuration policies from Intune";
    public const string PoliciesComplianceFilterName = "--include-compliance";
    public const string PoliciesComplianceFilterDescription = "Retrieves all compliance policies from Intune";

    // configuration policies
    public const string ConfigurationPolicyCommandName = "configuration";
    public const string ConfigurationPolicyCommandDescription = "Gives you options to select a specific configuration policy from Intune";
    
    // compliance policies
    public const string CompliancePolicyCommandName = "compliance";
    public const string CompliantPolicyCommandDescription = "Gives you options to select a specific compliance policy from Intune";    
   
    // assignments 
    public const string AssignmentsCommandName = "assignments"; 
    public const string AssignmentsCommandDescription = "Retrieves all assignments in Intune";
    public const string AssignmentsGroupIdCommandName = "--group-id"; 
    public const string AssignmentsGroupIdCommandDescription = "Enter the Entra ID Group ID";
    public const string AssignmentsGroupNameCommandName = "--group-name"; 
    public const string AssignmentsGroupNameCommandDescription = "Enter the Entra ID Group name";
    
    // assignment groups
    public const string AssignmentsGroupsCommandName = "groups";
    public const string AssignmentsGroupsCommandDescription = "Shows all group assignements in Intune";
    
    // assignment filters
    public const string AssignmentFilterCommandName = "filters";
    public const string AssignmentFilterCommandDescription = "Shows the assignement filters in Intune";
    
    public const string AssignmentFilterEvaluationCommandName = "evaluate";
    public const string AssignmentFilterEvaluationDescription = "Evaluates the connected devices in the filter";

    // device status
    public const string DeviceStatusCommandName = "--device-status";
    public const string DeviceStatusCommandDescription = "Shows the devices statusses in the policy";
    
    // device OS overview
    public const string DeviceOsBuildOverviewCommandName = "osbuild";
    public const string DeviceOsBuildOverviewCommandDescription = "Shows the devices OS build overview";  

    // arguments
    public const string ExportCsvArg = "--export-csv";
    public const string ExportCsvArgDescription = "Exports the content to a csv file";
    public const string BackupArg = "--backup";
    public const string BackupArgDescription = "Creates a JSON file as a backup. Enter the path to store the JSON files";
    public const string RemoveArg = "--remove";
    public const string RemoveArgDescription = "Removes all duplicate devices from Intune";
    public const string NonAssignedArg = "--non-assigned"; 
    public const string NonAssignedArgDescription = "Retrieve a list of all non-assigned compliance policies from Intune";
    public const string IdArg = "--id";
    public const string IdArgDescription = "The unique id of the item in Intune";
    public const string ForceArg = "--force";
    public const string ForceArgDescription = "Forces an action in Intune";
}
