using IntuneAssistant.Models.Options;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface ICompliancePoliciesService
{
    Task<List<DeviceCompliancePolicy>?> GetCompliancePoliciesListAsync(string accessToken);
    Task<List<DeviceCompliancePolicyAssignment>?> GetCompliancePolicyAssignmentListAsync(string accessToken, string policyId);
}
