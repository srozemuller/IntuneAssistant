using IntuneAssistant.Models.Options;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface ICompliancePoliciesService
{
    Task<List<DeviceCompliancePolicy>?> GetCompliancePoliciesListAsync(string accessToken, bool assignmentFilter);
    Task<DeviceComplianceDeviceStatusCollectionResponse>? GetCompliancePolicyDeviceStatusByIdAsync(string accessToken, string policyId);
    Task<DeviceCompliancePolicy>? GetCompliancePolicyByIdAsync(string accessToken, string policyId);
}
