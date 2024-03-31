using IntuneAssistant.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace IntuneAssistant.Models;


public sealed record GraphValueResponse<T>
{
    [JsonProperty("@odata.count")]
    public int? ODataCount { get; set; }

    [JsonProperty("@odata.nextLink")]
    public string? ODataNextLink { get; set; }

    public IEnumerable<T>? Value { get; set; }
}

public static class CustomJsonOptions
{
    public static JsonSerializerOptions Default()
    {
        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true
        };

        options.Converters.Add(new ODataTypeConverter());
        return options;

    }
}

public class JsonSettings
{
    public static JsonSerializerSettings Default() {
        var settings = new JsonSerializerSettings
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
            NullValueHandling = NullValueHandling.Ignore
        };
        return settings;
    }
}
