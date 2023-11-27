using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace IntuneAssistant.Helpers;

public static class JsonHelper
{
    public static object ObjectToJson(object? content)
    {
        var settings = new JsonSerializerSettings
        {
            ContractResolver = new DefaultContractResolver
            {
                NamingStrategy = new CamelCaseNamingStrategy
                {
                    ProcessDictionaryKeys = true,
                    OverrideSpecifiedNames = true
                }
            }
        };
        // Convert the object to JSON
        string jsonString = JsonConvert.SerializeObject(content, settings);
        return jsonString;
    }
}