using System.CommandLine;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Apps;

public class AppsListCmd : Command<FetchAppListCommandOptions, FetchAppListCommandHandler>
{
    public AppsListCmd() : base(CommandConfiguration.ListCommandName, CommandConfiguration.ListCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
    }
}

public class FetchAppListCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
}

public class FetchAppListCommandHandler : ICommandOptionsHandler<FetchAppListCommandOptions>
{
    private readonly IAppsService _appsService;
    private readonly IIdentityHelperService _identityHelperService;

    public FetchAppListCommandHandler(IAppsService appsService, IIdentityHelperService identityHelperService)
    {
        _appsService = appsService;
        _identityHelperService = identityHelperService;
    }

    public async Task<int> HandleAsync(FetchAppListCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        var apps = new List<WindowsLobAppModel>();
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
                apps = await _appsService.GetWindowsLobAppsListAsync(accessToken);
            });

        if (exportCsvProvided)
        {
            ExportData.ExportCsv(apps,options.ExportCsv);
            return 0;
        }
        if (apps?.Count == 0)
        {
            AnsiConsole.MarkupLine("No apps found");
            return 0;
        }
        
        var table = new Table();
        table.Collapse();
        table.AddColumn("Id");
        table.AddColumn("DisplayName");
        table.AddColumn("Description");
        table.AddColumn("Is Featured");
        table.AddColumn("Is Assigned");

        foreach (var app in apps)
        {
            table.AddRow(
                app.Id,
                app.DisplayName.EscapeMarkup(),
                app.Description.Length > 50 ? app.Description.Substring(0,50) + "..." : app.Description,
                app.IsFeatured.ToString(),
                app.IsAssigned.ToString()
            );
        }
        AnsiConsole.Write(table);

        return 0;
    }
}
