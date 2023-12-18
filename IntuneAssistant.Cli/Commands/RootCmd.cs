using System.CommandLine;
using IntuneAssistant.Cli.Commands.Assignments;
using IntuneAssistant.Cli.Commands.Auth;
using IntuneAssistant.Cli.Commands.AutoPilot;
using IntuneAssistant.Cli.Commands.Devices;
using IntuneAssistant.Cli.Commands.Policies;
using IntuneAssistant.Cli.Commands.Show;
namespace IntuneAssistant.Cli.Commands;

public static class RootCmd
{
    public static RootCommand New()
    {
        var rootCommand = new RootCommand();

        rootCommand.AddCommand( new AssignmentsCmd());
        rootCommand.AddCommand(AuthCmd.New());
        rootCommand.AddCommand(AutoPilotCmd.New());
        rootCommand.AddCommand(DevicesCmd.New());
        rootCommand.AddCommand(PoliciesCmd.New());
        rootCommand.AddCommand(ShowCmd.New());
        
        return rootCommand;
    }
}
