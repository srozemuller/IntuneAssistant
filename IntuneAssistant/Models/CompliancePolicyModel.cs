using Newtonsoft.Json;

namespace IntuneAssistant.Models;

public class CompliancePolicy
{
    [JsonProperty("@odata.type")]
    public string OdataType { get; set; }
    public List<string> RoleScopeTagIds { get; set; }
    public string Id { get; set; }
    public DateTime CreatedDateTime { get; set; }
    public string Description { get; set; }
    public DateTime LastModifiedDateTime { get; set; }
    public string DisplayName { get; set; }
    public int Version { get; set; }
    public bool PasswordRequired { get; set; }
    public bool PasswordBlockSimple { get; set; }
    public bool PasswordRequiredToUnlockFromIdle { get; set; }
    public int? PasswordMinutesOfInactivityBeforeLock { get; set; }
    public int? PasswordExpirationDays { get; set; }
    public int? PasswordMinimumLength { get; set; }
    public int? PasswordMinimumCharacterSetCount { get; set; }
    public string PasswordRequiredType { get; set; }
    public int? PasswordPreviousPasswordBlockCount { get; set; }
    public bool RequireHealthyDeviceReport { get; set; }
    public string OsMinimumVersion { get; set; }
    public string OsMaximumVersion { get; set; }
    public string MobileOsMinimumVersion { get; set; }
    public string MobileOsMaximumVersion { get; set; }
    public bool EarlyLaunchAntiMalwareDriverEnabled { get; set; }
    public bool BitLockerEnabled { get; set; }
    public bool SecureBootEnabled { get; set; }
    public bool CodeIntegrityEnabled { get; set; }
    public bool MemoryIntegrityEnabled { get; set; }
    public bool KernelDmaProtectionEnabled { get; set; }
    public bool VirtualizationBasedSecurityEnabled { get; set; }
    public bool FirmwareProtectionEnabled { get; set; }
    public bool StorageRequireEncryption { get; set; }
    public bool ActiveFirewallRequired { get; set; }
    public bool DefenderEnabled { get; set; }
    public string DefenderVersion { get; set; }
    public bool SignatureOutOfDate { get; set; }
    public bool RtpEnabled { get; set; }
    public bool AntivirusRequired { get; set; }
    public bool AntiSpywareRequired { get; set; }
    public bool DeviceThreatProtectionEnabled { get; set; }
    public string DeviceThreatProtectionRequiredSecurityLevel { get; set; }
    public bool ConfigurationManagerComplianceRequired { get; set; }
    public bool TpmRequired { get; set; }
    public string DeviceCompliancePolicyScript { get; set; }
    public List<string> ValidOperatingSystemBuildRanges { get; set; }
    [JsonProperty("assignments@odata.context")]
    public string AssignmentsOdataContext { get; set; }
    public List<CompliancePolicyAssignment> Assignments { get; set; }
}

public class CompliancePolicyAssignment : IAssignment
{
    public string Id { get; set; }
    public string Source { get; set; }
    public string SourceId { get; set; }
    public Target Target { get; set; }
}