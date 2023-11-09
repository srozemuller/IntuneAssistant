using System.CommandLine;
using IntuneAssistant.Cli.Commands.Auth;
using IntuneAssistant.Cli.Commands.Devices;

namespace IntuneAssistant.Cli.Commands;

public static class RootCmd
{
    public static RootCommand New()
    {
        var rootCommand = new RootCommand
        {
            AuthCmd.New(),
            DevicesCmd.New(),
        };

        return rootCommand;
    }
}
