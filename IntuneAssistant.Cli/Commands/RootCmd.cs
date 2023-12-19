using System.CommandLine;
using IntuneAssistant.Cli.Commands.Apps;
using IntuneAssistant.Cli.Commands.Auth;
using IntuneAssistant.Cli.Commands.Devices;
using IntuneAssistant.Cli.Commands.Policies;
using IntuneAssistant.Cli.Commands.Show;
namespace IntuneAssistant.Cli.Commands;

public static class RootCmd
{
    public static RootCommand New()
    {
        var rootCommand = new RootCommand();

        rootCommand.AddCommand(AuthCmd.New());
        rootCommand.AddCommand(AppsCmd.New());
        rootCommand.AddCommand(DevicesCmd.New());
        rootCommand.AddCommand(PoliciesCmd.New());
        rootCommand.AddCommand(ShowCmd.New());
        
        return rootCommand;
    }
}
