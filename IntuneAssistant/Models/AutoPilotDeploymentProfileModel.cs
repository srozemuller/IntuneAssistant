using Newtonsoft.Json;

namespace IntuneAssistant.Models;

public class AutoPilotDeploymentProfileModel
{
    [JsonProperty("@odata.type")]
    public string OdataType { get; set; }
    public string Id { get; set; }
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public string Language { get; set; }
    public DateTime CreatedDateTime { get; set; }
    public DateTime LastModifiedDateTime { get; set; }
    public object EnrollmentStatusScreenSettings { get; set; }
    public bool ExtractHardwareHash { get; set; }
    public string DeviceNameTemplate { get; set; }
    public string DeviceType { get; set; }
    public bool EnableWhiteGlove { get; set; }
    public List<string> RoleScopeTagIds { get; set; }
    public object ManagementServiceAppId { get; set; }
    public OutOfBoxExperienceSettings OutOfBoxExperienceSettings { get; set; }
}

public class OutOfBoxExperienceSettings
{
    public bool HidePrivacySettings { get; set; }
    public bool HideEULA { get; set; }
    public string UserType { get; set; }
    public string DeviceUsageType { get; set; }
    public bool SkipKeyboardSelectionPage { get; set; }
    public bool HideEscapeLink { get; set; }
}