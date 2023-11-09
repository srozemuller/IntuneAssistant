using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IDeviceDuplicateService
{
    Task<List<ManagedDevice>?> GetDuplicateDevicesListAsync();
    Task<List<ManagedDevice>?> RemoveDuplicateDevicesAsync();
}
