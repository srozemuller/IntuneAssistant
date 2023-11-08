using System.CommandLine;
using IntuneAssistant.Helpers;
using IntuneAssistant.Interfaces;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands;

public class LoginToIntuneCommand : Command<LoginCommandOptions,LoginCommandHandler>
{
    public LoginToIntuneCommand() : base("login", "Log in to an Intune tenant")
    {
        AddOption(new Option<string>("--tenant-id", "The tenant id to log in to"));
        var option = new Option<string>("--login-mode", "The way how to log in to Intune");
        option.FromAmong("devicecode", "interactive");
        AddOption(option);
        AddOption(new Option<string>("--access-token", "If you have an access token already, then fill in"));
        AddOption(new Option<string>("--client-id", "Provide the application client id"));
        AddOption(new Option<string>("--client-secret", "Provide the application client secret"));
    }
}

public class LoginCommandOptions : ICommandOptions
{
    public string TenantId { get; set; } = string.Empty;
    public string LoginMode { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
}


public class LoginCommandHandler : ICommandOptionsHandler<LoginCommandOptions>
{
    private readonly ILoginService _loginService;

    public LoginCommandHandler(ILoginService loginService)
    {
        _loginService = loginService;
    }
    public async Task<int> HandleAsync(LoginCommandOptions options)
    {
        var validationMessages = new List<string>();
        var tenantIdProvided = !string.IsNullOrWhiteSpace(options.TenantId);
        var loginModeProvided = !string.IsNullOrWhiteSpace(options.LoginMode);
        var accessTokenProvided = !string.IsNullOrWhiteSpace(options.AccessToken);
        var clientIdProvided = !string.IsNullOrWhiteSpace(options.ClientId);
        var clientSecretProvided = !string.IsNullOrWhiteSpace(options.ClientSecret);

        if (!tenantIdProvided)
            validationMessages.Add("Argument --tenant-id is required");
        
        var tenantIdParsed = Guid.TryParse(options.TenantId, out var tenantId);
        if (tenantIdProvided && !tenantIdParsed)
            validationMessages.Add("Provided Tenant ID is not a valid GUID");

        if (!accessTokenProvided)
        {
            if (loginModeProvided)
            {
                switch (options.LoginMode)
                {
                    case "interactive":
                        await _loginService.LoginInterActive();
                        break;
                    case "devicecode":
                        await _loginService.LoginWithDeviceCode();
                        break;
                }
            }
            else
            {
                Console.WriteLine("No login mode provided, using clientCredential flow.");
                if (!clientIdProvided)
                    validationMessages.Add("Argument --client-id is required");
                if (!clientSecretProvided)
                    validationMessages.Add("Argument --client-secret is required");
                await _loginService.LoginWithClientCredential(options.TenantId, options.ClientId, options.ClientSecret); //loginService.LoginWithClientCredential(options.TenantId,options.ClientId,options.ClientSecret);
            }
        }

        if (validationMessages.Count > 0)
        {
            foreach (var message in validationMessages)
                AnsiConsole.MarkupLineInterpolated($"[red]{message}[/]");

            return 1;
        }

        AnsiConsole.MarkupLineInterpolated($"[yellow bold]Tenant ID:[/] [underline]{tenantId.ToString()}[/]");
        
        return 0;
    }
}
