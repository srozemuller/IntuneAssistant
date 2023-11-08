using System.CommandLine;
using IntuneAssistant.Interfaces;

namespace IntuneAssistant.Cli.Commands;


public class LogoutFromIntuneCommand : Command<FetchLogoutCommandOptions, FetchLogoutCommandHandler>
{
    public LogoutFromIntuneCommand() : base("logout", "Log out from Intune")
    {
        
    }
}

public class FetchLogoutCommandOptions : ICommandOptions
{
    
}


public class FetchLogoutCommandHandler : ICommandOptionsHandler<FetchLogoutCommandOptions>
{
    private readonly ILogoutService _logoutService;

    public FetchLogoutCommandHandler(ILogoutService logoutService)
    {
        _logoutService = logoutService;
    }

    public async Task<int> HandleAsync(FetchLogoutCommandOptions options)
    {
        await _logoutService.LogoutFromIntune();
        return 0;
    }
}
