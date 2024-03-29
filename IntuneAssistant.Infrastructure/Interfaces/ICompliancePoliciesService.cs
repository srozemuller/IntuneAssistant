using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface ICompliancePoliciesService
{
    Task<List<CompliancePolicyModel>?> GetCompliancePoliciesListAsync(string? accessToken);
    Task<DeviceComplianceDeviceStatusCollectionResponse> GetCompliancePolicyDeviceStatusAsync(string? accessToken, string policyId);
}
