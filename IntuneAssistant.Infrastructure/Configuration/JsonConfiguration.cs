using System.Text.Json;
using System.Text.Json.Serialization;

namespace IntuneAssistant.Infrastructure.Configuration;

public static class JsonSerializerConfiguration
{
    public static JsonSerializerOptions? Default => new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        Converters =
        {
            new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)
        }
    };
}