using Microsoft.IdentityModel.Tokens;

namespace IntuneAssistant.Models;

public class OsBuildModel
{
    public string OperatingSystem { get; set; } = String.Empty;
    public string OsVersion { get; init; } = String.Empty;
    public int Count { get; init; } = 0;
}

public static class OsModelExtensions
{
    public static OsBuildModel ToOsBuildModel(this OsBuildModel osModel)
    {
        var operatingSystem = String.Empty;
        bool isWindows10 = osModel.OsVersion.Contains(".1904");
        bool isWindows11 = osModel.OsVersion.Contains(".22");
        if (isWindows10)
        {
            operatingSystem = "Windows 10";
        }
        if (isWindows11)
        {
            operatingSystem = "Windows 11";
        }
        if (operatingSystem.IsNullOrEmpty())
        {
            operatingSystem = osModel.OperatingSystem;
        }
        return new OsBuildModel
        {
            OperatingSystem = operatingSystem,
            OsVersion = osModel.OsVersion,
            Count = osModel.Count
        };
    }
} 