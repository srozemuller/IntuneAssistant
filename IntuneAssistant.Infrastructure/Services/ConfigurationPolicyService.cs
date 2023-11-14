using System.Text;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models.Options;
using Microsoft.Graph.Beta.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;
using Microsoft.IdentityModel.Tokens;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class ConfigurationPolicyService : IConfigurationPolicyService
{
    public async Task<List<DeviceManagementConfigurationPolicy>?> GetConfigurationPoliciesListAsync(string accessToken, bool assignmentFilter)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var results = new List<DeviceManagementConfigurationPolicy>();
        try
        {
            var result = await graphClient.DeviceManagement.ConfigurationPolicies.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });

            if (result?.Value != null)
                if (assignmentFilter)
                {
                    results.AddRange(result.Value.Where(r=> r.Assignments.IsNullOrEmpty()));
                }
                else
                {
                    results.AddRange(result.Value);
                }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
            return null;
        }

        return results;
    }
}
