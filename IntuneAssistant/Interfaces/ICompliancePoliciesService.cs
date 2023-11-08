using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Interfaces;

public interface ICompliancePoliciesService
{
    Task<List<DeviceCompliancePolicy>> GetCompliancePoliciesListAsync();
    Task<List<DeviceCompliancePolicyAssignment>> GetCompliancePolicyAssignmentListAsync(string policyId);
}