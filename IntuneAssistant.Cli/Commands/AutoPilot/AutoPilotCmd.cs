using System.CommandLine;
using IntuneAssistant.Cli.Commands.AutoPilot.DeploymentProfiles;

namespace IntuneAssistant.Cli.Commands.AutoPilot;

public static class AutoPilotCmd
{
    public static Command New()
    {

        var deploymentProfilesCommand = new Command(CommandConfiguration.AutoPilotCommandName,
            CommandConfiguration.AutoPilotCommandDescription);
        var globalOption = new Option<Enums.FixedOptions?>(CommandConfiguration.OutputFlags,
            CommandConfiguration.OutputFlagsDescription);
        deploymentProfilesCommand.AddGlobalOption(globalOption);
        
        deploymentProfilesCommand.AddCommand(DeploymentProfilesCmd.New());
        deploymentProfilesCommand.AddCommand(AutopilotDeploymentProfileDevicesCmd.New());
        
        return deploymentProfilesCommand;
    }
}
