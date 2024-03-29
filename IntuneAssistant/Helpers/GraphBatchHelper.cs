using System.Text;
using IntuneAssistant.Extensions;
using IntuneAssistant.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace IntuneAssistant.Helpers;

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
        public static string CreateUrlListBatchOutput(List <string> urlList)
        {
            var outputObject = new
            {
                requests = new List<object>()
            };
            int requestId = 1;
            foreach (var urlValue in urlList)
            {
                var request = new
                {
                    id = requestId++,
                    method = "GET",
                    url = urlValue
                };
                outputObject.requests.Add(request);
            }
            return JsonConvert.SerializeObject(outputObject, Formatting.Indented);
        }
    }
    public static class RoleDefinitionsBatchHelper
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
                    
                        var request = new
                        {
                            id = requestId++,
                            method = "GET",
                            url = $"/deviceManagement/roleDefinitions('{intent["id"]}')/roleAssignments"
                        };
                        outputObject.requests.Add(request);
                    
                }

                return JsonConvert.SerializeObject(outputObject, Formatting.Indented);
            }
        }
    }
    public static class RoleAssignmentsBatchHelper
    {
        public static string CreateOutput(List<InnerResponseForAssignments<RoleAssignmentModel>> roleAssignmentsList)
        {

            var outputObject = new
            {
                requests = new List<object>()
            };
                int requestId = 1;
                foreach (var intent in roleAssignmentsList.Select(a => a.Body).Where(r => r.ODataCount > 0))
                {
                    var roleId = intent.ODataContext.FetchIdFromContext();
                    var assignmentIds = intent.Value?.Select(v => v.Id);
                    foreach (var id in assignmentIds)
                    {
                        var request = new
                        {
                            id = requestId++,
                            method = "GET",
                            url = $"/deviceManagement/roleDefinitions('{roleId}')/roleAssignments/{id}"
                        };
                        outputObject.requests.Add(request);
                    }
                   
                }
                return JsonConvert.SerializeObject(outputObject, Formatting.Indented);
            }
        }
    
    public static List<List<T>> ChunkList<T>(List<T> items, int chunkSize)
    {
        var list = new List<List<T>>();
        for (int i = 0; i < items.Count; i += chunkSize)
        {
            list.Add(items.GetRange(i, Math.Min(chunkSize, items.Count - i)));
        }
        return list;
    }
    
    public static List<string> CreateUrlListBatchOutput(List<string> urlList)
    {
        var chunks = ChunkList(urlList, 20);
        var outputJsonStrings = new List<string>();

        foreach (var chunk in chunks)
        {
            var outputObject = new
            {
                requests = new List<object>()
            };

            int requestId = 1;
            foreach (var urlValue in chunk)
            {
                var request = new
                {
                    id = requestId++,
                    method = "GET",
                    url = urlValue
                };
                outputObject.requests.Add(request);
            }
            outputJsonStrings.Add(JsonConvert.SerializeObject(outputObject));
        }
        return outputJsonStrings;
    }
}