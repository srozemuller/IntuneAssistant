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
    public bool Logout { get; set; } = false;
}

public sealed class AuthLogoutCommandHandler : ICommandOptionsHandler<AuthLogoutCommandOptions>
{
    private readonly IIdentityHelperService _identityHelperService;

    public AuthLogoutCommandHandler(IIdentityHelperService identityHelperService, IDeviceService deviceService)
    {
        _identityHelperService = identityHelperService;
    }

    public async Task<int> HandleAsync(AuthLogoutCommandOptions commandOptions)
    {
        AnsiConsole.MarkupLine("[yellow]Logging out...[/]");
        var accountsLoggedOut = await _identityHelperService.LogoutAsync();

        if (accountsLoggedOut == -1)
        {
            AnsiConsole.MarkupLine($"[red]Failed to logout[/]");
            return -1;
        }

        AnsiConsole.MarkupLine($"[green]Successfully logged out of all accounts[/]");
        return 0;
    }
}
