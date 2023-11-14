using System.CommandLine;
using IntuneAssistant.Cli.Commands.Auth;
using IntuneAssistant.Cli.Commands.Devices;
using IntuneAssistant.Cli.Commands.Show;

namespace IntuneAssistant.Cli.Commands;

public static class RootCmd
{
    public static RootCommand New()
    {
        var rootCommand = new RootCommand
        {
            AuthCmd.New(),
            DevicesCmd.New(),
            ShowCmd.New()
        };

        return rootCommand;
    }
}
