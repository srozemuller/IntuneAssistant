using IntuneAssistant.Infrastructure.Interfaces;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Auth.Login;

public class AuthLoginCommand : Command<AuthLoginCommandOptions, AuthLoginCommandHandler>
{
    public AuthLoginCommand() : base(CommandConfiguration.AuthLoginCommandName, CommandConfiguration.AuthLoginCommandDescription)
    {
    }
}

public class AuthLoginCommandOptions : ICommandOptions
{
}

public sealed class AuthLoginCommandHandler : ICommandOptionsHandler<AuthLoginCommandOptions>
{
    private readonly IIdentityHelperService _identityHelperService;

    public AuthLoginCommandHandler(IIdentityHelperService identityHelperService)
    {
        _identityHelperService = identityHelperService;
    }

    public async Task<int> HandleAsync(AuthLoginCommandOptions options)
    {
        var accessToken = string.Empty;

        await AnsiConsole.Status()
            .Spinner(Spinner.Known.Default)
            .StartAsync("Authenticating with Microsoft Entra ID...", async ctx =>
            {
                accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
            });

        AnsiConsole.MarkupLine(!string.IsNullOrEmpty(accessToken)
            ? ":check_mark_button:  Successfully authenticated with Microsoft Entra ID"
            : ":hollow_red_circle:  Failed to authenticate with Microsoft Entra ID");

        if (string.IsNullOrEmpty(accessToken))
            return -1;

        return 0;
    }
}
