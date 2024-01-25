using System.Text;
using IntuneAssistant.Constants;
using IntuneAssistant.Enums;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;
using Newtonsoft.Json;
using JsonSerializer = System.Text.Json.JsonSerializer;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class TenantInformationService : ITenantInformationService
{
    private readonly HttpClient _http = new();

    public async Task<List<RoleDefinitionModel>?> GetRoleDefinitionsListAsync(string accessToken)
    {
        var results = new List<RoleDefinitionModel>();
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        try
        {
            var nextUrl = GraphUrls.RoleDefinitionsUrl;
            while (nextUrl is not null)
            {
                try
                {
                    var response = await _http.GetAsync(nextUrl);
                    var responseStream = await response.Content.ReadAsStreamAsync();

                    using var sr = new StreamReader(responseStream);
                    // Read the stream to a string
                    var content = await sr.ReadToEndAsync();

                    // Deserialize the string to your model
                    var result = JsonConvert.DeserializeObject<GraphValueResponse<RoleDefinitionModel>>(content);
                    if (result?.Value is null)
                    {
                        nextUrl = null;
                        continue;
                    }

                    results.AddRange(result.Value);
                    nextUrl = result.ODataNextLink;
                }
                catch (HttpRequestException e)
                {
                    nextUrl = null;
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching roles from Intune: " + ex.ToMessage());
            return null;
        }
        return results;
    }
}