using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface ICompliancePoliciesService
{
    Task<List<DeviceCompliancePolicy>?> GetCompliancePoliciesListAsync(string accessToken, bool assignmentFilter);
    Task<DeviceComplianceDeviceStatusCollectionResponse> GetCompliancePolicyDeviceStatusAsync(string accessToken, string policyId);
}
