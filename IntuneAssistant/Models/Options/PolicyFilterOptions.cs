namespace IntuneAssistant.Models.Options;

public class PolicyFilterOptions
{
    public bool IncludeCompliance { get; init; } = false;
    public bool IncludeConfiguration { get; init; } = false;
    public bool SelectNonAssigned { get; init; } = false;
}