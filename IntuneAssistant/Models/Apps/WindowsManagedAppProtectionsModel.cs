namespace IntuneAssistant.Models.Apps;

public class WindowsManagedAppProtectionsModel
{
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public DateTime CreatedDateTime { get; set; }
    public DateTime LastModifiedDateTime { get; set; }
    public List<string> RoleScopeTagIds { get; set; }
    public string Id { get; set; }
    public string Version { get; set; }
    public bool IsAssigned { get; set; }
    public int DeployedAppCount { get; set; }
    public bool PrintBlocked { get; set; }
    public string AllowedInboundDataTransferSources { get; set; }
    public string AllowedOutboundClipboardSharingLevel { get; set; }
    public string AllowedOutboundDataTransferDestinations { get; set; }
    public object AppActionIfUnableToAuthenticateUser { get; set; }
    public string MaximumAllowedDeviceThreatLevel { get; set; }
    public string MobileThreatDefenseRemediationAction { get; set; }
    public object MinimumRequiredSdkVersion { get; set; }
    public object MinimumWipeSdkVersion { get; set; }
    public object MinimumRequiredOsVersion { get; set; }
    public object MinimumWarningOsVersion { get; set; }
    public object MinimumWipeOsVersion { get; set; }
    public object MinimumRequiredAppVersion { get; set; }
    public object MinimumWarningAppVersion { get; set; }
    public object MinimumWipeAppVersion { get; set; }
    public object MaximumRequiredOsVersion { get; set; }
    public object MaximumWarningOsVersion { get; set; }
    public object MaximumWipeOsVersion { get; set; }
    public string PeriodOfflineBeforeWipeIsEnforced { get; set; }
    public string PeriodOfflineBeforeAccessCheck { get; set; }
    public string AssignmentsODataContext { get; set; }
    public List<Assignment> Assignments { get; set; }
}