using System.CommandLine;

namespace IntuneAssistant.Cli.Commands.AutoPilot.DeploymentProfiles;

public static class DeploymentProfilesCmd
{
    public static Command New()
    {

        var deploymentProfilesCommand = new Command(CommandConfiguration.DevicesDeploymentProfilesCommandName,
            CommandConfiguration.DevicesDeploymentProfilesCommandDescription);
        var globalOption = new Option<Enums.FixedOptions?>(CommandConfiguration.OutputFlags,
            CommandConfiguration.OutputFlagsDescription);
        deploymentProfilesCommand.AddGlobalOption(globalOption);
        
        deploymentProfilesCommand.AddCommand(new DeviceDeploymentProfilesListCmd());
        deploymentProfilesCommand.AddCommand(new DeviceDeploymentProfileShowCmd());
        deploymentProfilesCommand.AddCommand(AutopilotDeploymentProfileDevicesCmd.New());
    return deploymentProfilesCommand;
    }
}
