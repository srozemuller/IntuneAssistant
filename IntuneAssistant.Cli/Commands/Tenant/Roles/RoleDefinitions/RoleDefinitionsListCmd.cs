using System.CommandLine;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Tenant.Roles.RoleDefinitions;


public class RolesListCmd : Command<FetchRolesListCommandOptions, FetchRolesListCommandHandler>
{
    public RolesListCmd() : base(CommandConfiguration.ListCommandName, CommandConfiguration.ListCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
    }
}

public class FetchRolesListCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
}

public class FetchRolesListCommandHandler : ICommandOptionsHandler<FetchRolesListCommandOptions>
{
    private readonly ITenantInformationService _tenantInformationService;
    private readonly IIdentityHelperService _identityHelperService;

    public FetchRolesListCommandHandler(ITenantInformationService tenantInformationService, IIdentityHelperService identityHelperService)
    {
        _tenantInformationService = tenantInformationService;
        _identityHelperService = identityHelperService;
    }

    public async Task<int> HandleAsync(FetchRolesListCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        var roles = new List<RoleDefinitionModel>();
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }
        var exportCsvProvided = !string.IsNullOrWhiteSpace(options.ExportCsv);

        // Show progress spinner while fetching data
        await AnsiConsole.Status()
            .StartAsync("Fetching apps from Intune", async _ =>
            {
                roles = await _tenantInformationService.GetRoleDefinitionsListAsync(accessToken);
            });

        if (exportCsvProvided)
        {
            ExportData.ExportCsv(roles,options.ExportCsv);
            return 0;
        }
        if (roles?.Count == 0)
        {
            AnsiConsole.MarkupLine("No roles found");
            return 0;
        }
        
        var table = new Table();
        table.Collapse();
        table.AddColumn("Id");
        table.AddColumn("DisplayName");
        table.AddColumn("Description");
        table.AddColumn("Is BuildIn role");

        foreach (var role in roles)
        {
            table.AddRow(
                role.Id,
                role.DisplayName.EscapeMarkup(),
                role.Description.Length > 50 ? role.Description.Substring(0,50) + "..." : role.Description,
                role.IsBuiltIn.ToString()
            );
        }
        AnsiConsole.Write(table);
        return 0;
    }
}
