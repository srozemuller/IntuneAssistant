using System.CommandLine;
using IntuneAssistant.Cli.Commands.Apps.Dependencies;

namespace IntuneAssistant.Cli.Commands.Apps;

public static class AppsCmd
{
    public static Command New()
    {

        var appsCommand = new Command(CommandConfiguration.AppsCommandName,
            CommandConfiguration.AppsCommandDescription);
        var globalOption = new Option<Enums.FixedOptions?>(CommandConfiguration.OutputFlags,
            CommandConfiguration.OutputFlagsDescription);
        appsCommand.AddGlobalOption(globalOption);
        
        appsCommand.AddCommand(new AppsListCmd());
        appsCommand.AddCommand(AppsDependenciesCmd.New());

        return appsCommand;
    }
}