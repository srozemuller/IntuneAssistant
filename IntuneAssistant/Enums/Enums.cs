namespace IntuneAssistant.Enums;


public enum FixedOptions
{
    table,
    json,
    csv,
}

public enum ResourceTypes
{
    UpdateRingConfiguration,
    CompliancePolicy,
    ConfigurationPolicy,
    DeviceHealthScript,
    DeviceManagementScript,
    WindowsAutopilotDeploymentProfile,
    MobileApp,
    AppConfigurationPolicy,
    WindowsManagedAppProtection,
    IosManagedAppProtection,
    AndroidManagedAppProtection,
    WindowsFeatureUpdate,
    WindowsDriverUpdate,
    MacOsShellScript,
    DiskEncryptionPolicy
}

public enum AssignmentODataTypes
{
    AllDevicesAssignmentTarget,
    GroupAssignmentTarget,
    AllLicensedUsersAssignmentTarget
}
