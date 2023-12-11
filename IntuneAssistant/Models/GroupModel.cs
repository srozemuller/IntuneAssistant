namespace IntuneAssistant.Models;

public sealed record GroupModel
{
    public string Id { get; init; } = String.Empty;
    public string DisplayName { get; init; } = String.Empty;
    public string Description { get; init; } = String.Empty;
    public string CreatedDateTime { get; init; } = String.Empty;
}