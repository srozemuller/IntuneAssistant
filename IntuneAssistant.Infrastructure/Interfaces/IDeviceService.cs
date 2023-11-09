using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IDeviceService
{
    Task<List<ManagedDevice>?> GetManagedDevicesListAsync(string accessToken);
    Task<List<ManagedDevice>?> GetNonCompliantManagedDevicesListAsync(string accessToken);
}
