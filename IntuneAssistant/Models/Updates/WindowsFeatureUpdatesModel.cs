using Newtonsoft.Json;

namespace IntuneAssistant.Models.Updates;

public class WindowsFeatureUpdatesModel
{
    public string Id { get; set; }
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public string FeatureUpdateVersion { get; set; }
    public DateTime CreatedDateTime { get; set; }
    public DateTime LastModifiedDateTime { get; set; }
    public List<string> RoleScopeTagIds { get; set; }
    public string DeployableContentDisplayName { get; set; }
    public DateTime EndOfSupportDate { get; set; }
    public bool InstallLatestWindows10OnWindows11IneligibleDevice { get; set; }
    public RolloutSettings RolloutSettings { get; set; }

    [JsonProperty("assignments@odata.context")]
    public string AssignmentsOdataContext { get; set; }

    public List<Assignment> Assignments { get; set; }
}
public class RolloutSettings
{
    public DateTime? OfferStartDateTimeInUTC { get; set; }
    public DateTime? OfferEndDateTimeInUTC { get; set; }
    public int? OfferIntervalInDays { get; set; }
}