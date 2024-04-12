using IntuneAssistant.Models.AutoPilot;
namespace IntuneAssistant.Infrastructure.Interfaces;

public interface IAutoPilotService
{
    Task<List<WindowsAutopilotDeploymentProfileModel>?> GetWindowsAutopilotDeploymentProfilesListAsync(string? accessToken);
}

