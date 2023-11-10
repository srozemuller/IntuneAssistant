using System.CommandLine;
using IntuneAssistant.Cli.Commands.Auth.Login;
using IntuneAssistant.Cli.Commands.Auth.Logout;

namespace IntuneAssistant.Cli.Commands.Auth;

public static class AuthCmd
{
    public static Command New()
    {
        var authCommand = new Command(CommandConfiguration.AuthCommandName, CommandConfiguration.AuthCommandDescription);
        var authLoginCommand = new AuthLoginCommand();
        var authLogoutCommand = new AuthLogoutCommand();

        authCommand.AddCommand(authLoginCommand);
        authCommand.AddCommand(authLogoutCommand);

        return authCommand;
    }
}
