using IntuneAssistant.Models;

namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IDeploymentProfilesService
{
    Task<List<AutoPilotDeploymentProfileModel>?> GetAutoPilotDeploymentProfilesListAsync(string accessToken);
    Task<List<AutoPilotDeploymentProfileModel>?> GetAutoPilotDeploymentProfileByNameAsync(string accessToken, string name);
    Task<AutoPilotDeploymentProfileCountModel?> GetAutoPilotDeploymentProfileDeviceCountAsync(string accessToken, string profileId);
    Task<List<AutopilotDeviceProfile>?> GetAutoPilotDevicesByDeploymentProfileNameListAsync(string accessToken, string name);
}
