using IntuneAssistant.Models;
using IntuneAssistant.Models.Apps;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IAppsService
{
    Task<List<WindowsLobAppModel>?> GetWindowsLobAppsListAsync(string? accessToken);
    Task<WindowsLobAppModel> GetAppByIdAsync(string accessToken, string applicationId);
    
    Task<WindowsLobAppModel?> GetAppByNameAsync(string accessToken, string applicationName);
    
    Task<List<MobileAppDependencyModel>?> GetAppDependenciesListAsync(string? accessToken);
    Task<List<MobileAppDependencyModel>?> GetAppDependenciesByAppNameAsync(string accessToken, string applicationDisplayName);
    Task<List<WindowsManagedAppProtectionsModel>?> GetWindowsManagedAppProtectionsListAsync(string accessToken);
    Task<List<IosAppProtectionModel>?> GetIosAppProtectionsListAsync(string accessToken);
    Task<List<AndroidAppProtectionModel>?> GetAndroidAppProtectionsListAsync(string accessToken);
}