using System.CommandLine;
using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.Extensions.Logging;
using IntuneAssistant.Models;
using IntuneAssistant.Extensions;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Assignments;

public class AssignmentsCmd : Command<FetchAssignmentsCommandOptions, FetchAssignmentsCommandHandler>
{
    public AssignmentsCmd() : base(CommandConfiguration.AssignmentsCommandName, CommandConfiguration.AssignmentsCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
    }
}

public class FetchAssignmentsCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
}

public class FetchAssignmentsCommandHandler : ICommandOptionsHandler<FetchAssignmentsCommandOptions>
{

    private readonly IAssignmentsService _assignmentsService;
    private readonly IIdentityHelperService _identityHelperService;

    public FetchAssignmentsCommandHandler(IIdentityHelperService identityHelperService, IAssignmentsService assignmentsService)
    {
        _assignmentsService = assignmentsService;
        _identityHelperService = identityHelperService;
    }
    public async Task<int> HandleAsync(FetchAssignmentsCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        var allResults = new List<AssignmentsModel>();
        var exportCsv = !string.IsNullOrWhiteSpace(options.ExportCsv);
        string targetName = String.Empty;
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }
        await AnsiConsole.Status().SpinnerStyle(Color.Orange1)
            .StartAsync(
                $"Fetching global assignments overview from Intune",
                async _ =>
                {
                    var results = await _assignmentsService.GetCompliancePoliciesAssignmentsListAsync(accessToken, null);
                    if (results is not null)
                    {
                        allResults.AddRange(results);
                    }
                });
        if (allResults.Count > 0)
        {
            
            var table = new Table();
            table.Collapse();
            table.AddColumn("ResourceType");
            table.AddColumn("ResourceId");
            table.AddColumn("ResourceName");
            table.AddColumn("AssignmentType");
            table.AddColumn("FilterId");
            table.AddColumn("FilterType");
            foreach (var filter in allResults)
            {
                table.AddRow(
                    filter.ResourceType,
                    filter.ResourceId,
                    filter.ResourceName,
                    filter.AssignmentType,
                    filter.FilterId,
                    filter.FilterType
                );
            }
            AnsiConsole.Write(table);
            return 0;
        }
        
        if (exportCsv)
        {
            await AnsiConsole.Status()
                .StartAsync($"Exporting results to {options.ExportCsv}",
                    async _ => { ExportData.ExportCsv(allResults, options.ExportCsv); });
        }
        AnsiConsole.MarkupLine($"[yellow]No assignments found in Intune.[/]");
        return -1;
    }
}
