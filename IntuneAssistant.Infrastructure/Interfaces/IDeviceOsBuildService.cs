using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IDeviceOsBuildService
{
    Task<List<ManagedDevice?>> GetManagedDevicesOsBuildListAsync();
}
