using Newtonsoft.Json;

namespace IntuneAssistant.Models.Apps;

public class DefaultMobileAppModel
{
    public string OdataType { get; set; }
    public string Id { get; set; }
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public string Publisher { get; set; }
    public string LargeIcon { get; set; }
    public DateTime CreatedDateTime { get; set; }
    public DateTime LastModifiedDateTime { get; set; }
    public bool IsFeatured { get; set; }
    public string PrivacyInformationUrl { get; set; }
    public string InformationUrl { get; set; }
    public string Owner { get; set; }
    public string Developer { get; set; }
    public string Notes { get; set; }
    public int UploadState { get; set; }
    public string PublishingState { get; set; }
    public bool IsAssigned { get; set; }
    public List<string> RoleScopeTagIds { get; set; }
    public int DependentAppCount { get; set; }
    public int SupersedingAppCount { get; set; }
    public int SupersededAppCount { get; set; }
    public string AppAvailability { get; set; }
    public string Version { get; set; }
    public string PackageId { get; set; }
    public string AppStoreUrl { get; set; }
    public MinimumSupportedOperatingSystem MinimumSupportedOperatingSystem { get; set; }

    [JsonProperty("assignments@odata.context")]
    public string AssignmentsOdataContext { get; set; }

    public List<ConfigPolicyAssignment> Assignments { get; set; }
}

public class MinimumSupportedOperatingSystem
{
    public bool V4_0 { get; set; }
    public bool V4_0_3 { get; set; }
    public bool V4_1 { get; set; }
    public bool V4_2 { get; set; }
    public bool V4_3 { get; set; }
    public bool V4_4 { get; set; }
    public bool V5_0 { get; set; }
    public bool V5_1 { get; set; }
    public bool V6_0 { get; set; }
    public bool V7_0 { get; set; }
    public bool V7_1 { get; set; }
    public bool V8_0 { get; set; }
    public bool V8_1 { get; set; }
    public bool V9_0 { get; set; }
    public bool V10_0 { get; set; }
    public bool V11_0 { get; set; }
}