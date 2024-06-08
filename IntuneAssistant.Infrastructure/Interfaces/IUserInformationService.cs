using IntuneAssistant.Models.Users;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IUserInformationService
{
    Task<UserModel?> GetUserInformationByIdAsync(string? accessToken, Guid userId);
    Task<UserModel?> GetUserInformationByNameAsync(string? accessToken, string userName);
    Task<List<UserModel>> GetUserInformationByIdsCollectionListAsync(string? accessToken, List<string> userIds);
}