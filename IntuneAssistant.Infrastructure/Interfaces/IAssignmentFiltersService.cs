using IntuneAssistant.Infrastructure.Responses;
using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IAssignmentFiltersService
{
    Task<List<AssignmentFiltersModel>?> GetAssignmentFiltersListAsync(string? accessToken);
    Task<AssignmentFiltersDeviceEvaluationResponse> GetAssignmentFilterDeviceListAsync(string? accessToken, string filterId);
    Task<DeviceAndAppManagementAssignmentFilter> GetAssignmentFilterInfoAsync(string? accessToken, string filterId);
}