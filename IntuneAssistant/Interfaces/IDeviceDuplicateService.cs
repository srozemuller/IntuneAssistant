using Microsoft.Graph.Beta.Models;
namespace IntuneAssistant.Interfaces;

public interface IDeviceDuplicateService
{
    Task<List<ManagedDevice>?> GetDuplicateDevicesListAsync();
    Task<List<ManagedDevice>?> RemoveDuplicateDevicesAsync();
}
