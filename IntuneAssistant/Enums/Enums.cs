using System.ComponentModel;

namespace IntuneAssistant.Enums;


public enum OutputOptions
{
    table,
    json,
    csv,
    html
}

public enum ResourceTypes
{
    [Description("Update Ring Configuration")]
    UpdateRingConfiguration,
    [Description("Windows Compliance Policy")]
    WindowsCompliancePolicy,
    [Description("iOS Compliance Policy")]
    IosCompliancePolicy,
    [Description("macOS Compliance Policy")]
    MacOsCompliancePolicy,
    [Description("Configuration Policy")]
    ConfigurationPolicy,
    [Description("Device Health Script")]
    DeviceHealthScript,
    [Description("Device Management Script")]
    DeviceManagementScript,
    [Description("Windows Autopilot Deployment Profile")]
    WindowsAutopilotDeploymentProfile,
    [Description("Mobile Application")]
    MobileApp,
    [Description("Application Configuration Policy")]
    AppConfigurationPolicy,
    [Description("Windows Managed Application Protection")]
    WindowsManagedAppProtection,
    [Description("iOS Managed Application Protection")]
    IosManagedAppProtection,
    [Description("Android Managed Application Protection")]
    AndroidManagedAppProtection,
    [Description("Windows Feature Update")]
    WindowsFeatureUpdate,
    [Description("Windows Driver Update")]
    WindowsDriverUpdate,
    [Description("macOS Shell Script")]
    MacOsShellScript,
    [Description("Disk Encryption Policy")]
    DiskEncryptionPolicy,
    [Description("macOS Update Policy")]
    MacOsUpdatePolicy,
    [Description("Platform Scripts")]
    PlatformScripts,
    [Description("Managed Application Policy")]
    ManagedAppPolicy,
    [Description("Device Platform Restriction")]
    DevicePlatformRestriction,
    [Description("Device Limit Restriction")]
    DeviceLimitRestriction,
    [Description("macOS Custom Attributes")]
    MacOsCustomAttributes,
    [Description("iOS LineOfBusiness Application Configuration")]
    IosLobAppConfiguration,
    [Description("Windows 32 LOB Application")]
    Win32LobApp,
    [Description("Windows 32 Store Application")]
    Win32StoreApp,
    [Description("Winget Application")]
    WingetApp,
    [Description("Android Device Owner General Device Configuration")]
    AndroidDeviceOwnerGeneralDeviceConfiguration,
    [Description("Windows 10 Custom Configuration")]
    Windows10CustomConfiguration,
    [Description("iOS Update Configuration")]
    IosUpdateConfiguration,
    [Description("macOS Software Update Configuration")]
    MacOsSoftwareUpdateConfiguration,
    [Description("Windows Health Monitoring Configuration")]
    WindowsHealthMonitoringConfiguration,
    [Description("Device Enrollment Platform Restrictions Configuration")]
    DeviceEnrollmentPlatformRestrictionsConfiguration,
    [Description("Device Enrollment Limit Configuration")]
    DeviceEnrollmentLimitConfiguration,
    [Description("User")]
    User,
    [Description("Device")]
    Device,
}

public enum AssignmentODataTypes
{
    [Description("All Devices (Intune)")]
    AllDevicesAssignmentTarget,
    [Description("Entra ID Group")]
    GroupAssignmentTarget,
    [Description("All Users (Intune)")]
    AllLicensedUsersAssignmentTarget,
    [Description("Entra ID Group Exclude")]
    GroupExcludeAssignmentTarget
}
