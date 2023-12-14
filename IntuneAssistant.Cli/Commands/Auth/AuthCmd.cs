using System.CommandLine;
using IntuneAssistant.Cli.Commands.Auth.Login;
using IntuneAssistant.Cli.Commands.Auth.Logout;

namespace IntuneAssistant.Cli.Commands.Auth;

public static class AuthCmd
{
    public static Command New()
    {
        var authCommand = new Command(CommandConfiguration.AuthCommandName, CommandConfiguration.AuthCommandDescription);

        authCommand.AddCommand(new AuthLoginCommand());
        authCommand.AddCommand(new AuthLogoutCommand());
        authCommand.AddCommand(new AuthShowCommand());

        return authCommand;
    }
}
