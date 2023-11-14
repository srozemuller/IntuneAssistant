using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.Graph.Beta.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;
using Microsoft.IdentityModel.Tokens;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class AssignmentFiltersService : IAssignmentFiltersService
{
    public async Task<List<DeviceAndAppManagementAssignmentFilter>?> GetAssignmentFiltersListAsync(string accessToken)
    {
            var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
            var results = new List<DeviceAndAppManagementAssignmentFilter>();
            try
            {
                var result = await graphClient.DeviceManagement.AssignmentFilters.GetAsync(requestConfiguration =>
                {
                    requestConfiguration.QueryParameters.Filter = null;
                });

                if (result?.Value != null)
                    results.AddRange(result.Value);
                    
            }
            catch (ODataError ex)
            {
                Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
                return null;
            }

            return results;
    }
}
