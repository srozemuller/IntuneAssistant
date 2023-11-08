namespace IntuneAssistant.Models;

public enum IsInstalledResult
{
    Error = -1,
    Installed,
    NotInstalled,
    UpgradeAvailable
}

public enum PackageSource
{
    Unknown = 0,
    Store,
    Winget,
}

public enum InstallerType
{
    Unknown = 0,
    Msi,
    Msix,
    Appx,
    Exe,
    Zip,
    Inno,
    Nullsoft,
    Wix,
    Burn,
    Pwa,
    Portable,
}

public enum InstallerContext
{
    Unknown = 0,
    User,
    System,
}

public enum ComplianteState
{
    Unknown,
    Error,
    Compliant
    
}

internal static class EnumParsers
{
    public static InstallerType ParseInstallerType(string? input)
    {
        return input?.ToLowerInvariant() switch
        {
            "msi" => InstallerType.Msi,
            "msix" => InstallerType.Msix,
            "appx" => InstallerType.Appx,
            "exe" => InstallerType.Exe,
            "zip" => InstallerType.Zip,
            "inno" => InstallerType.Inno,
            "nullsoft" => InstallerType.Nullsoft,
            "wix" => InstallerType.Wix,
            "burn" => InstallerType.Burn,
            "pwa" => InstallerType.Pwa,
            "portable" => InstallerType.Portable,
            _ => InstallerType.Unknown,
        };
    }

    public static InstallerContext ParseInstallerContext(string? input)
    {
        return input?.ToLowerInvariant() switch
        {
            "user" => InstallerContext.User,
            "system" => InstallerContext.System,
            "machine" => InstallerContext.System,
            _ => InstallerContext.Unknown,
        };
    }

    public static ComplianteState ParseArchitecture(string? input)
    {
        return input?.ToLowerInvariant() switch
        {
            "Compliant" => ComplianteState.Compliant,
            "Error" => ComplianteState.Error,
            _ => ComplianteState.Unknown,
        };
    }


}
