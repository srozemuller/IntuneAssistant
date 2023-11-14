using System.CommandLine;
using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.Graph.Beta.Models;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Filters;

public class FiltersCmd : Command<FetchFiltersCommandOptions, FetchFiltersCommandHandler>
{
    public FiltersCmd() : base(CommandConfiguration.AssignmentFilterCommandName, CommandConfiguration.AssignmentFilterDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
    }
}

public class FetchFiltersCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
}

public class FetchFiltersCommandHandler : ICommandOptionsHandler<FetchFiltersCommandOptions>
{

    private readonly IAssignmentFiltersService _assignmentFiltersService;
    private readonly IIdentityHelperService _identityHelperService;

    public FetchFiltersCommandHandler(IIdentityHelperService identityHelperService, IAssignmentFiltersService assignmentFiltersService)
    {
        _assignmentFiltersService = assignmentFiltersService;
        _identityHelperService = identityHelperService;
    }
    public async Task<int> HandleAsync(FetchFiltersCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        var results = new List<DeviceAndAppManagementAssignmentFilter>();
        var exportCsv = !string.IsNullOrWhiteSpace(options.ExportCsv);
        var table = new Table();
        table.Collapse();
        table.AddColumn("Id");
        table.AddColumn("DisplayName");
        table.AddColumn("Rule");
        
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }
        results = await _assignmentFiltersService.GetAssignmentFiltersListAsync(accessToken);

        foreach (var filter in results)
        {
            table.AddRow(
                filter.Id,
                filter.DisplayName,
                filter.Rule
            );
                    
        }
        AnsiConsole.Write(table);
        
        return 0;
    }
}
