using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.Graph.Beta.Models;
using Microsoft.Identity.Client;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Auth;

public class AuthShowCommand : Command<AuthShowCommandOptions, AuthShowCommandHandler>
{
    public AuthShowCommand() : base(CommandConfiguration.AuthShowCommandName, CommandConfiguration.AuthShowCommandDescription)
    {
    }
}

public class AuthShowCommandOptions : ICommandOptions
{
}

public sealed class AuthShowCommandHandler : ICommandOptionsHandler<AuthShowCommandOptions>
{
    private readonly IIdentityHelperService _identityHelperService;

    public AuthShowCommandHandler(IIdentityHelperService identityHelperService)
    {
        _identityHelperService = identityHelperService;
    }

    public async Task<int> HandleAsync(AuthShowCommandOptions options)
    {
        var users = new List<IAccount>();
        await AnsiConsole.Status()
            .Spinner(Spinner.Known.Default)
            .StartAsync("Searching for users...", async ctx =>
            {
                users = await _identityHelperService.GetCurrentUserContext();
            });

        foreach (var user in users)
        {
           AnsiConsole.WriteLine($"{user.Username} is logged in at tenantId {user.HomeAccountId.TenantId}"); 
        }
        return 0;
    }
}
