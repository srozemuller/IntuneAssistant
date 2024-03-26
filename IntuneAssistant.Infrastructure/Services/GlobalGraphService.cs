using System.Net;
using System.Text;
using IntuneAssistant.Constants;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Newtonsoft.Json;
using Spectre.Console;

namespace IntuneAssistant.Infrastructure.Services;


public sealed class GlobalGraphService : IGlobalGraphService
{
    private readonly HttpClient _http = new();
    
    public async Task<List<DirectoryObjectsModel>?> GetDirectoryObjectsByIdListAsync(string? accessToken, List<object> ids)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var result = new List<DirectoryObjectsModel>();
        try
        {
            IdsContainer idsContainer = new IdsContainer
            {
                Ids = new List<string>{}
            };
            foreach (var id in ids)
            {
                if (!idsContainer.Ids.Contains(id))
                {
                    idsContainer.Ids.Add(id.ToString());
                }
            }

            var nextUrl = GraphUrls.GetByIdsUrl;
            var json = JsonConvert.SerializeObject(idsContainer, JsonSettings.Default());
            // Create the HttpContent for the request
                HttpContent content = new StringContent(json, Encoding.UTF8, "application/json");
                // Send the POST request
                HttpResponseMessage response = await _http.PostAsync(nextUrl, content);
                // Check if the request was successful (status code 200-299)
                    if (response.IsSuccessStatusCode)
                    {
                         var responseContent = await response.Content.ReadAsStringAsync();
                         var resultObjects = JsonConvert.DeserializeObject<GraphValueResponse<DirectoryObjectsModel>>(responseContent);
                         if (resultObjects?.Value != null)
                         {
                                 foreach (var resultObject in resultObjects.Value)
                                 {
                                     result.Add(resultObject);
                                 }
                         }
                    }
                    else
                    {
                        string errorContent = await response.Content.ReadAsStringAsync();
                        Console.WriteLine("Error Content: " + errorContent);
                    }
        }
        catch (HttpRequestException e)
        {
            AnsiConsole.WriteLine("\nHTTP Exception Caught!");
            AnsiConsole.WriteLine("Message :{0} ", e.Message);
        }
        catch (Exception e)
        {
            AnsiConsole.WriteLine("\nException Caught!");
            AnsiConsole.WriteLine("Message :{0} ", e.Message);
        }
        return result;
    }
}