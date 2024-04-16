namespace IntuneAssistant.Models.AutoPilot;

public class WindowsAutopilotDeploymentProfileModel
{
    public string ODataContext { get; set; }
    public string ODataType { get; set; }
    public string Id { get; set; }
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public string Language { get; set; }
    public string Locale { get; set; }
    public DateTime CreatedDateTime { get; set; }
    public DateTime LastModifiedDateTime { get; set; }
    public object EnrollmentStatusScreenSettings { get; set; }
    public bool ExtractHardwareHash { get; set; }
    public bool HardwareHashExtractionEnabled { get; set; }
    public string DeviceNameTemplate { get; set; }
    public string DeviceType { get; set; }
    public bool EnableWhiteGlove { get; set; }
    public bool PreprovisioningAllowed { get; set; }
    public List<string> RoleScopeTagIds { get; set; }
    public object ManagementServiceAppId { get; set; }
    public OutOfBoxExperienceSettings OutOfBoxExperienceSettings { get; set; }
    public OutOfBoxExperienceSetting OutOfBoxExperienceSetting { get; set; }
    public string AssignmentsODataContext { get; set; }
    public List<Assignment> Assignments { get; set; }
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

public class OutOfBoxExperienceSetting
{
    public bool PrivacySettingsHidden { get; set; }
    public bool EulaHidden { get; set; }
    public string UserType { get; set; }
    public string DeviceUsageType { get; set; }
    public bool KeyboardSelectionPageSkipped { get; set; }
    public bool EscapeLinkHidden { get; set; }
}