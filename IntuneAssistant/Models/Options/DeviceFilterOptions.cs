namespace IntuneAssistant.Models.Options;

public sealed record DeviceFilterOptions
{
    public bool IncludeWindows { get; init; } = false;
    public bool IncludeMacOs { get; init; } = false;
    public bool IncludeIos { get; init; } = false;
    public bool IncludeAndroid { get; init; } = false;
    public bool SelectNonCompliant { get; init; } = false;
    
}
