using IntuneAssistant.Infrastructure.Interfaces;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Auth;

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

    public AuthLoginCommandHandler(IIdentityHelperService identityHelperService, IDeviceService deviceService)
    {
        _identityHelperService = identityHelperService;
    }

    public async Task<int> HandleAsync(AuthLoginCommandOptions options)
    {
        AnsiConsole.MarkupLine("[yellow]Authenticating with Azure AD[/]");

        // Expect a browser to open and the user to authenticate
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();

        AnsiConsole.MarkupLine(accessToken != null
            ? "[green]Successfully authenticated with Azure AD[/]"
            : $"[red]Failed to authenticate with Azure AD[/]");

        if (accessToken is null)
            return -1;

        return 0;
    }
}
