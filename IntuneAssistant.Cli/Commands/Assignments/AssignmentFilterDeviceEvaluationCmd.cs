using System.CommandLine;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Responses;
using Microsoft.Graph.Beta.Models;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Filters;

public class AssignmentFilterDeviceEvaluationCmd : Command<FetchDevicesByFilterCommandOptions, FetchDevicesByFilterCommandHandler>
{
    public AssignmentFilterDeviceEvaluationCmd() : base(CommandConfiguration.AssignmentFilterEvaluationCommandName, CommandConfiguration.AssignmentFilterEvaluationDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<string>(CommandConfiguration.IdArg, CommandConfiguration.IdArgDescription));
    }
}

public class FetchDevicesByFilterCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
    public string Id { get; set; } = String.Empty;
}

public class FetchDevicesByFilterCommandHandler : ICommandOptionsHandler<FetchDevicesByFilterCommandOptions>
{

    private readonly IAssignmentFiltersService _assignmentFiltersService;
    private readonly IIdentityHelperService _identityHelperService;

    public FetchDevicesByFilterCommandHandler(IIdentityHelperService identityHelperService, IAssignmentFiltersService assignmentFiltersService)
    {
        _assignmentFiltersService = assignmentFiltersService;
        _identityHelperService = identityHelperService;
    }
    public async Task<int> HandleAsync(FetchDevicesByFilterCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        var results = new AssignmentFiltersDeviceEvaluationResponse();
        var filterInfo = new DeviceAndAppManagementAssignmentFilter();
        var exportCsv = !string.IsNullOrWhiteSpace(options.ExportCsv);
        var filterId = options.Id;
        var table = new Table();
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }
        
        results = await _assignmentFiltersService.GetAssignmentFilterDeviceListAsync(accessToken, filterId);
        if (results.TotalRowCount > 0)
        {
            table.Collapse();
            table.AddColumn(results.Columns[1].Name);  // Device Category
            table.AddColumn(results.Columns[2].Name);  // Device Id
            table.AddColumn(results.Columns[5].Name);  // Device DisplayName
            table.AddColumn(results.Columns[8].Name);  // Operating System SKU
            table.AddColumn(results.Columns[9].Name);  // OS Version
            table.AddColumn(results.Columns[10].Name); // Device ownership

            foreach (var filter in results.Values)
            {
                table.AddRow(
                    filter[1],
                    filter[2],
                    filter[5],
                    filter[8],
                    filter[9],
                    filter[10]
                );

            }
            AnsiConsole.Write(table);
            return 0;
        }
        AnsiConsole.MarkupLine($"[yellow]No devices found in filter with id {filterId}.[/]");
        return -1;
    }
}
