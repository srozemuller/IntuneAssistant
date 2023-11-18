using IntuneAssistant.Infrastructure.Responses;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IAssignmentFiltersService
{
    Task<List<DeviceAndAppManagementAssignmentFilter>?> GetAssignmentFiltersListAsync(string accessToken);
    Task<AssignmentFiltersDeviceEvaluationResponse> GetAssignmentFilterDeviceListAsync(string accessToken, string filterId);

    Task<DeviceAndAppManagementAssignmentFilter> GetAssignmentFilterInfoAsync(string accessToken, string filterId);

}