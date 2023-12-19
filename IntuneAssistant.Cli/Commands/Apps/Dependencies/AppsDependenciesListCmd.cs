using System.CommandLine;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.IdentityModel.Tokens;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Apps.Dependencies;

public class AppsDependenciesListCmd : Command<FetchAppDependenciesCommandOptions, FetchAppDependenciesCommandHandler>
{
    public AppsDependenciesListCmd() : base(CommandConfiguration.ListCommandName, CommandConfiguration.ListCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<bool>(CommandConfiguration.TreeViewArg, CommandConfiguration.TreeViewArgDescription));
        AddOption(new Option<string>(CommandConfiguration.ApplicationNameArg, CommandConfiguration.AppliationNameArgDescription));
    }
}

public class FetchAppDependenciesCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
    public bool TreeView { get; set; } = false;
    public string ApplicationName { get; set; } = String.Empty;
}

public class FetchAppDependenciesCommandHandler : ICommandOptionsHandler<FetchAppDependenciesCommandOptions>
{
    private readonly IAppsService _appsService;
    private readonly IIdentityHelperService _identityHelperService;

    public FetchAppDependenciesCommandHandler(IAppsService appsService, IIdentityHelperService identityHelperService)
    {
        _appsService = appsService;
        _identityHelperService = identityHelperService;
    }

    public async Task<int> HandleAsync(FetchAppDependenciesCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        var appDependencies = new List<MobileAppDependencyModel>();
        var treeViewProvided = options.TreeView;
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }
        var exportCsvProvided = !string.IsNullOrWhiteSpace(options.ExportCsv);
        
        await AnsiConsole.Status()
            .StartAsync($"Fetching app dependencies in Intune",
                async _ => { appDependencies = await _appsService.GetAppDependenciesListAsync(accessToken); });
        

        if (exportCsvProvided)
        {
            ExportData.ExportCsv(appDependencies,options.ExportCsv);
            return 0;
        }
        if (appDependencies is null)
        {
            AnsiConsole.MarkupLine("No apps found");
            return 0;
        }

        if (treeViewProvided)
        {
            var appDependenciesList = appDependencies.Where(a=> a.AppDisplayName.Contains(options.ApplicationName)).GroupBy(u => u.AppId).Select(grp => grp.ToList()).ToList();
            foreach (var app in appDependenciesList)
            {
                var appInfo = app.Select(x => x);
                var apptree = new Tree($"[yellow]{app.Select(x => x.AppDisplayName).FirstOrDefault()}[/]");
                // Add some nodes
                var foo = apptree.AddNode("Dependencies");
                var table3 = new Table()
                    .RoundedBorder()
                    .AddColumn("Depends On")
                    .AddColumn("DependsOn App Type");
                var table2 = foo.AddNode(table3);
                foreach (var application in appInfo)
                {
                    var color = "white";
                    if (application.TargetType == "parent")
                    {
                        color = "darkorange";
                    }
                    table3.AddRow($"{application.TargetDisplayName.EscapeMarkup()}", $"[{color}]{application.TargetType}[/]");
                }
                AnsiConsole.Write(apptree);
            }
            return 0;
        }
        
        var table = new Table();
        table.Collapse();
        table.AddColumn("App Id");
        table.AddColumn("App DisplayName");
        table.AddColumn("Depends On");
        table.AddColumn("DependsOn App Type");
        table.AddColumn("Auto Install");
        var applicationName = options.ApplicationName;
        foreach (var app in appDependencies.Where(a=> a.AppDisplayName.Contains(options.ApplicationName)).ToList())
        {
            table.AddRow(
                app.AppId,
                app.AppDisplayName.EscapeMarkup(),
                app.TargetDisplayName.EscapeMarkup(),
                app.TargetType,
                app.DependencyType.IsNullOrEmpty() ? "No" : app.DependencyType
            );
        }

        AnsiConsole.Write(table);

        return 0;
    }
}
