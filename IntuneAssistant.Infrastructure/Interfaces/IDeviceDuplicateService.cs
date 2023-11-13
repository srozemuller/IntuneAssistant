using IntuneAssistant.Models.Options;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IDeviceDuplicateService
{
    Task<List<ManagedDevice>?> GetDuplicateDevicesListAsync(string accessToken, DeviceFilterOptions? filterOptions, ExportOptions? exportOptions);
    Task<List<ManagedDevice>?> RemoveDuplicateDevicesAsync(string accessToken);
    
}
