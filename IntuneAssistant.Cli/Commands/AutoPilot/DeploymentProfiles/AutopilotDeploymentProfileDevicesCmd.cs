using System.CommandLine;

namespace IntuneAssistant.Cli.Commands.AutoPilot.DeploymentProfiles;

public static class AutopilotDeploymentProfileDevicesCmd
{
    public static Command New()
    {

        var autopilotDevicesCommand = new Command(CommandConfiguration.DevicesCommandName,
            CommandConfiguration.DevicesCommandName);

        autopilotDevicesCommand.AddCommand(new AutopilotProfileDevicesListCmd());
        return autopilotDevicesCommand;
    }
}
