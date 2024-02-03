using IntuneAssistant.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IGlobalGraphService
{
    Task<List<DirectoryObjectsModel>?> GetDirectoryObjectsByIdListAsync(string accessToken, List<object> ids);
}