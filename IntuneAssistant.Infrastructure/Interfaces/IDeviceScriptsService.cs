using IntuneAssistant.Models;
using IntuneAssistant.Models.Assignments;
using IntuneAssistant.Models.Scripts;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IDeviceScriptsService
{
    Task<List<DeviceManagementScriptsModel>?> GetDeviceManagementScriptsListAsync(string? accessToken);
    Task<List<DeviceShellScriptModel>?> GetDeviceShellScriptsListAsync(string? accessToken);
    Task<List<DeviceHealthScriptsModel>?> GetDeviceHealthScriptsListAsync(string? accessToken);
    Task<List<ResourceAssignmentsModel>?> GetMacOsCustomAttributesScriptsAssignmentsListAsync(string accessToken);
    
}