using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace IntuneAssistant.Extensions;

public class GraphBatchHelper
{
    public static class IntentHelper
    {
        public static string CreateOutput(Stream inputStream)
        {
            using (var streamReader = new StreamReader(inputStream, Encoding.UTF8))
            using (var jsonReader = new JsonTextReader(streamReader))
            {
                var inputObject = JObject.Load(jsonReader);
                var outputObject = new
                {
                    requests = new List<object>()
                };

                int requestId = 1;
                foreach (var intent in inputObject["value"])
                {
                    if (intent["isAssigned"].ToObject<bool>())
                    {
                        var request = new
                        {
                            id = requestId++,
                            method = "GET",
                            url = $"/deviceManagement/intents('{intent["id"]}')?$expand=assignments($select=id,target)"
                        };
                        outputObject.requests.Add(request);
                    }
                }

                return JsonConvert.SerializeObject(outputObject, Formatting.Indented);
            }
        }
    }
}