using System.Text;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models.Options;
using Microsoft.Graph.Beta.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class CompliancePolicyService : ICompliancePoliciesService
{
    public async Task<List<DeviceCompliancePolicy>?> GetCompliancePoliciesListAsync(string accessToken)
    {
            var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
            var results = new List<DeviceCompliancePolicy>();
            try
            {
                var result = await graphClient.DeviceManagement.DeviceCompliancePolicies.GetAsync(requestConfiguration =>
                {
                    requestConfiguration.QueryParameters.Filter = null;
                    requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
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

    public async Task<List<DeviceCompliancePolicyAssignment>?> GetCompliancePolicyAssignmentListAsync(string accessToken, string policyId)
    {
        try
        {
            var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
            var result = await graphClient.DeviceManagement.DeviceCompliancePolicies[policyId].Assignments.GetAsync();
            return result?.Value;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
}
