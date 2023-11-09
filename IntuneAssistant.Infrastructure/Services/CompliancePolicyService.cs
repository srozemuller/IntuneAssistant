using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class CompliancePolicyService : ICompliancePoliciesService
{
    public async Task<List<DeviceCompliancePolicy>?> GetCompliancePoliciesListAsync(string accessToken)
    {
        try
        {
            var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
            var result = await graphClient.DeviceManagement.DeviceCompliancePolicies.GetAsync();

            return result?.Value;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
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
