using IntuneAssistant.Infrastructure.Interfaces;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Auth;

public class AuthCommand : Command<AuthCommandOptions, AuthCommandHandler>
{
    public AuthCommand() : base("auth", "Authenticate with Azure AD")
    {
    }
}

public class AuthCommandOptions : ICommandOptions
{
}

public sealed class AuthCommandHandler : ICommandOptionsHandler<AuthCommandOptions>
{
    private readonly IIdentityHelperService _identityHelperService;

    public AuthCommandHandler(IIdentityHelperService identityHelperService, IDeviceService deviceService)
    {
        _identityHelperService = identityHelperService;
    }

    public async Task<int> HandleAsync(AuthCommandOptions options)
    {
        AnsiConsole.MarkupLine("[yellow]Authenticating with Azure AD[/]");

        // Expect a browser to open and the user to authenticate
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        if (accessToken != null)
        {
            AnsiConsole.MarkupLine("[green]Successfully authenticated with Azure AD[/]");
            AnsiConsole.MarkupLineInterpolated($"[grey]Access Token: {accessToken}[/]");
        }
        else
        {
            AnsiConsole.MarkupLine($"[red]Failed to authenticate with Azure AD[/]");
        }

        if (accessToken is null)
            return -1;

        return 0;
    }
}
