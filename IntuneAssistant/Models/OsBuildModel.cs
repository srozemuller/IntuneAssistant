namespace IntuneAssistant.Models;

public class OsBuildModel
{
    public string OS { get; set; } = String.Empty;
    public string OsVersion { get; init; } = String.Empty;
    public int Count { get; init; } = 0;
}

public static class OsModelExtensions
{
    public static OsBuildModel ToOsBuildModel(this OsBuildModel osModel)
    {
        var operatingSystem = String.Empty;
        bool isWindows10 = osModel.OsVersion.StartsWith("1904");
        bool isWindows11 = osModel.OsVersion.StartsWith("22");
        if (isWindows10)
        {
            operatingSystem = "Windows10";
        }

        if (isWindows11)
        {
            operatingSystem = "Windows11";
        }
        return new OsBuildModel
        {
            OS = operatingSystem,
            OsVersion = osModel.OsVersion,
            Count = osModel.Count
        };
    }
} 