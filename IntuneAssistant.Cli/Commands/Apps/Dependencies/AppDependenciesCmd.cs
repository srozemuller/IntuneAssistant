using System.CommandLine;

namespace IntuneAssistant.Cli.Commands.Apps.Dependencies;

public static class AppsDependenciesCmd
{
    public static Command New()
    {
        var appsDependenciesCommand = new Command(CommandConfiguration.AppDependenciesCommandName,
            CommandConfiguration.AppDependenciesCommandDescription);
        
        appsDependenciesCommand.AddCommand(new AppsDependenciesListCmd());
        return appsDependenciesCommand;
    }
}