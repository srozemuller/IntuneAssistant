using Newtonsoft.Json;

namespace IntuneAssistant.Models;

public class MobileAppDependencyResponseModel
{
    [JsonProperty("@odata.type")]
    public string OdataType { get; set; }
    public string Id { get; set; }
    public string TargetId { get; set; }
    public string TargetDisplayName { get; set; }
    public string TargetDisplayVersion { get; set; }
    public string TargetPublisher { get; set; }
    public string TargetType { get; set; }
    public string? DependencyType { get; set; }

}

public class MobileAppDependencyModel
{
    [JsonProperty("@odata.type")] public string OdataType { get; set; }
    public string Id { get; set; }
    public string AppId { get; set; }
    public string AppDisplayName { get; set; }
    public string TargetId { get; set; }
    public string TargetDisplayName { get; set; }
    public string TargetDisplayVersion { get; set; }
    public string TargetPublisher { get; set; }
    public string TargetType { get; set; }
    public string? DependencyType { get; set; }

}


public static class DependencyModelExtensions
{
    public static MobileAppDependencyModel ToDependencyModel(this MobileAppDependencyResponseModel dependencyResponseModel, WindowsLobAppModel app)
    {
        return new MobileAppDependencyModel
        {
            AppId = app.Id,
            AppDisplayName = app.DisplayName,
            TargetDisplayName = dependencyResponseModel.TargetDisplayName,
            TargetType = dependencyResponseModel.TargetType,
            DependencyType = dependencyResponseModel.DependencyType,
        };
    }
}