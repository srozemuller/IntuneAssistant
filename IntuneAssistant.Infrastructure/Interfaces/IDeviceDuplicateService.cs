using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IDeviceDuplicateService
{
    Task<List<ManagedDevice>?> GetDuplicateDevicesListAsync(string accessToken);
    Task<List<ManagedDevice>?> RemoveDuplicateDevicesAsync(string accessToken);
    
}
