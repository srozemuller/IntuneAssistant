namespace IntuneAssistant.Models.Apps;

public class IosAppProtectionModel
{
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public DateTime CreatedDateTime { get; set; }
    public DateTime LastModifiedDateTime { get; set; }
    public List<string> RoleScopeTagIds { get; set; }
    public string Id { get; set; }
    public string Version { get; set; }
    public string PeriodOfflineBeforeAccessCheck { get; set; }
    public string PeriodOnlineBeforeAccessCheck { get; set; }
    public string AllowedInboundDataTransferSources { get; set; }
    public string AllowedOutboundDataTransferDestinations { get; set; }
    public bool OrganizationalCredentialsRequired { get; set; }
    public string AllowedOutboundClipboardSharingLevel { get; set; }
    public bool DataBackupBlocked { get; set; }
    public bool DeviceComplianceRequired { get; set; }
    public bool ManagedBrowserToOpenLinksRequired { get; set; }
    public bool SaveAsBlocked { get; set; }
    public string PeriodOfflineBeforeWipeIsEnforced { get; set; }
    public bool PinRequired { get; set; }
    public int MaximumPinRetries { get; set; }
    public bool SimplePinBlocked { get; set; }
    public int MinimumPinLength { get; set; }
    public string PinCharacterSet { get; set; }
    public string PeriodBeforePinReset { get; set; }
    public List<string> AllowedDataStorageLocations { get; set; }
    public bool ContactSyncBlocked { get; set; }
    public bool PrintBlocked { get; set; }
    public bool FingerprintBlocked { get; set; }
    public bool DisableAppPinIfDevicePinIsSet { get; set; }
    public string MaximumRequiredOsVersion { get; set; }
    public string MinimumRequiredOsVersion { get; set; }
    public string AppActionIfDeviceComplianceRequired { get; set; }
    public string AppActionIfMaximumPinRetriesExceeded { get; set; }
    public string PinRequiredInsteadOfBiometricTimeout { get; set; }
    public int AllowedOutboundClipboardSharingExceptionLength { get; set; }
    public string NotificationRestriction { get; set; }
    public int PreviousPinBlockCount { get; set; }
    public string ManagedBrowser { get; set; }
    public string MaximumAllowedDeviceThreatLevel { get; set; }
    public string MobileThreatDefenseRemediationAction { get; set; }
    public bool BlockDataIngestionIntoOrganizationDocuments { get; set; }
    public List<string> AllowedDataIngestionLocations { get; set; }
    public string AppActionIfUnableToAuthenticateUser { get; set; }
    public string DialerRestrictionLevel { get; set; }
    public string ProtectedMessagingRedirectAppType { get; set; }
    public bool IsAssigned { get; set; }
    public string TargetedAppManagementLevels { get; set; }
    public string AppGroupType { get; set; }
    public string AppDataEncryptionType { get; set; }
    public int DeployedAppCount { get; set; }
    public bool FaceIdBlocked { get; set; }
    public List<string> ManagedUniversalLinks { get; set; }
    public List<string> ExemptedUniversalLinks { get; set; }
    public List<ExemptedAppProtocol> ExemptedAppProtocols { get; set; }
    public List<Assignment> Assignments { get; set; }

    public class ExemptedAppProtocol
    {
        public string Name { get; set; }
        public string Value { get; set; }
    }

    public class Assignment
    {
        public string Id { get; set; }
        public string Source { get; set; }
        public string SourceId { get; set; }
        public AssignmentTarget Target { get; set; }

        public class AssignmentTarget
        {
            public string OdataType { get; set; }
            public string DeviceAndAppManagementAssignmentFilterId { get; set; }
            public string DeviceAndAppManagementAssignmentFilterType { get; set; }
            public string GroupId { get; set; }
        }
    }
}