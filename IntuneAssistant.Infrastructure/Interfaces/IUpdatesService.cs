using IntuneAssistant.Models;
using IntuneAssistant.Models.Apps;
using IntuneAssistant.Models.Updates;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IUpdatesService
{
    Task<List<WindowsFeatureUpdatesModel>?> GetWindowsFeatureUpdatesListAsync(string? accessToken);
    Task<List<WindowsDriverUpdatesModel>?> GetWindowsDriversUpdatesListAsync(string? accessToken);
    Task<List<WindowsQualityUpdateModel>?> GetWindowsQualityUpdatesListAsync(string? accessToken);
}