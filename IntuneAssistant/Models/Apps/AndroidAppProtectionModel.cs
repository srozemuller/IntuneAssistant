namespace IntuneAssistant.Models.Apps;

public class AndroidAppProtectionModel
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
    public string MinimumWarningOsVersion { get; set; }
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
    public bool ScreenCaptureBlocked { get; set; }
    public bool DisableAppEncryptionIfDeviceEncryptionIsEnabled { get; set; }
    public bool EncryptAppData { get; set; }
    public int DeployedAppCount { get; set; }
    public string MinimumRequiredPatchVersion { get; set; }
    public string MinimumWarningPatchVersion { get; set; }
    public string MinimumWipePatchVersion { get; set; }
    public string RequiredAndroidSafetyNetDeviceAttestationType { get; set; }
    public string AppActionIfAndroidSafetyNetDeviceAttestationFailed { get; set; }
    public string RequiredAndroidSafetyNetAppsVerificationType { get; set; }
    public string AppActionIfAndroidSafetyNetAppsVerificationFailed { get; set; }
    public string CustomBrowserPackageId { get; set; }
    public string CustomBrowserDisplayName { get; set; }
    public string MinimumRequiredCompanyPortalVersion { get; set; }
    public string MinimumWarningCompanyPortalVersion { get; set; }
    public string MinimumWipeCompanyPortalVersion { get; set; }
    public bool KeyboardsRestricted { get; set; }
    public List<string> AllowedAndroidDeviceModels { get; set; }
    public string AppActionIfAndroidDeviceModelNotAllowed { get; set; }
    public string CustomDialerAppPackageId { get; set; }
    public string CustomDialerAppDisplayName { get; set; }
    public bool BiometricAuthenticationBlocked { get; set; }
    public string RequiredAndroidSafetyNetEvaluationType { get; set; }
    public int BlockAfterCompanyPortalUpdateDeferralInDays { get; set; }
    public int WarnAfterCompanyPortalUpdateDeferralInDays { get; set; }
    public int WipeAfterCompanyPortalUpdateDeferralInDays { get; set; }
    public bool DeviceLockRequired { get; set; }
    public string AppActionIfDeviceLockNotSet { get; set; }
    public bool ConnectToVpnOnLaunch { get; set; }
    public string AppActionIfDevicePasscodeComplexityLessThanLow { get; set; }
    public string AppActionIfDevicePasscodeComplexityLessThanMedium { get; set; }
    public string AppActionIfDevicePasscodeComplexityLessThanHigh { get; set; }
    public bool RequireClass3Biometrics { get; set; }
    public bool RequirePinAfterBiometricChange { get; set; }
    public bool FingerprintAndBiometricEnabled { get; set; }
    public string MessagingRedirectAppPackageId { get; set; }
    public string MessagingRedirectAppDisplayName { get; set; }
    public List<ExemptedAppPackage> ExemptedAppPackages { get; set; }
    public List<string> ApprovedKeyboards { get; set; }
    public List<Assignment> Assignments { get; set; }
}

public class ExemptedAppPackage
{
    public string Name { get; set; }
    public string Value { get; set; }
}