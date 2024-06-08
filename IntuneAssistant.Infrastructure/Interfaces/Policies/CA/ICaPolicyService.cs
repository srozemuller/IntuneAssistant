using IntuneAssistant.Infrastructure.Responses;
using IntuneAssistant.Models;
using IntuneAssistant.Models.Policies.CA;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces.Policies.CA;

public interface ICaPolicyService
{
    Task<List<ConditionalAccessPolicyModel>?> GetCaPoliciesListAsync(string? accessToken);
}