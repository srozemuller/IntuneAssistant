using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Interfaces;

public interface IDeviceOsBuildService
{
    Task<List<ManagedDevice?>> GetManagedDevicesOsBuildListAsync();
}