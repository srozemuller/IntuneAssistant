using IntuneAssistant.Helpers;
using IntuneAssistant.Interfaces;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Services;

public class CompliancePolicyService : ICompliancePoliciesService
{
    private string _accessToken = string.Empty;
    private readonly ILoginService _loginService;
    public CompliancePolicyService(ILoginService loginService)
    {
        _loginService = loginService;
        Init(); 
    }

    private void Init()
    {
        _accessToken = Environment.GetEnvironmentVariable("ACCESS_TOKEN") ?? throw new Exception("No token provided");
    }

    public async Task<List<DeviceCompliancePolicy>?> GetCompliancePoliciesListAsync()
    {
        try
        {
            var graphClient = new GraphClient(_accessToken).GetAuthenticatedGraphClient();
            var result = await graphClient.DeviceManagement.DeviceCompliancePolicies.GetAsync();
            return result?.Value;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    public async Task<List<DeviceCompliancePolicyAssignment>> GetCompliancePolicyAssignmentListAsync(string policyId)
    {
        try
        {
            var graphClient = new GraphClient(_accessToken).GetAuthenticatedGraphClient();
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