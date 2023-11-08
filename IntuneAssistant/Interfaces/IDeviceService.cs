using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Interfaces;

public interface IDeviceService
{
    Task<List<ManagedDevice>?> GetManagedDevicesListAsync();
    Task<List<ManagedDevice>?> GetNonCompliantManagedDevicesListAsync();
}
