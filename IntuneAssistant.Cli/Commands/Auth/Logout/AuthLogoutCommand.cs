using IntuneAssistant.Infrastructure.Interfaces;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Auth.Logout;

public class AuthLogoutCommand : Command<AuthLogoutCommandOptions, AuthLogoutCommandHandler>
{
    public AuthLogoutCommand() : base(CommandConfiguration.AuthLogoutCommandName, CommandConfiguration.AuthLogoutCommandDescription)
    {
    }
}

public class AuthLogoutCommandOptions : ICommandOptions
{
}

public sealed class AuthLogoutCommandHandler : ICommandOptionsHandler<AuthLogoutCommandOptions>
{
    private readonly IIdentityHelperService _identityHelperService;

    public AuthLogoutCommandHandler(IIdentityHelperService identityHelperService)
    {
        _identityHelperService = identityHelperService;
    }

    public async Task<int> HandleAsync(AuthLogoutCommandOptions commandOptions)
    {
        await AnsiConsole.Status()
            .Spinner(Spinner.Known.Default)
            .StartAsync("Signing out of all cached accounts...", async ctx =>
            {
                try
                {
                    await _identityHelperService.LogoutAsync();
                    AnsiConsole.MarkupLine(":check_mark_button:  Successfully signed out of all cached accounts");
                }
                catch (Exception e)
                {
                    AnsiConsole.MarkupLine($":hollow_red_circle:  Failed to sign out of account(s): {e.Message}");
                }
            });

        return 0;
    }
}
