using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IAssignmentsService
{
    Task<List<AssignmentsModel>?> GetAssignmentsByGroupListAsync(string accessToken, Group groupId);
    Task<List<AssignmentsModel>?> GetAssignmentsListAsync(string accessToken);
}