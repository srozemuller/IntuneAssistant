using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IAssignmentFiltersService
{
    Task<List<DeviceAndAppManagementAssignmentFilter>?> GetAssignmentFiltersListAsync(string accessToken);
}