using IntuneAssistant.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface ITenantInformationService
{
    Task<List<RoleDefinitionModel>?> GetRoleDefinitionsListAsync(string? accessToken);
    Task<List<RoleAssignmentModel>?> GetRoleAssignmentsListAsync(string? accessToken, List<RoleDefinitionModel> roles);
}