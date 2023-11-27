using System.Text.Json.Serialization;

namespace IntuneAssistant.Models;

public sealed record GraphResponse<T>
{
    [JsonPropertyName("@odata.count")]
    public int? ODataCount { get; set; }

    [JsonPropertyName("@odata.nextLink")]
    public string? ODataNextLink { get; set; }

    public IEnumerable<T>? Value { get; set; }
}
