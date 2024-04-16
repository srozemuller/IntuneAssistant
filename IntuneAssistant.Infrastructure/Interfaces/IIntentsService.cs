using IntuneAssistant.Models.Intents;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IIntentsService
{
    Task<List<IntentsModel>?> GetDiskEncryptionPoliciesListAsync(string? accessToken);
    
    Task<List<IntentsModel>?> GetAllIntentsListAsync(string? accessToken);
    Task<List<IntentsModel>?> GetSecurityProfilesIntentsListAsync(string? accessToken);
    Task<List<IntentsModel>?> GetWindowsHelloIntentsListAsync(string? accessToken);
}