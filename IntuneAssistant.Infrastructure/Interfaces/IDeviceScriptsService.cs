using IntuneAssistant.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IDeviceScriptsService
{
    Task<List<DeviceScriptsModel>?> GetDeviceScriptsListAsync(string? accessToken);
    Task<List<DeviceScriptsModel>?> GetDeviceShellScriptsListAsync(string? accessToken);
}