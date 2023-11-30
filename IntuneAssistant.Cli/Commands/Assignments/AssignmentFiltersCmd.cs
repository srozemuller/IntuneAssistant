using System.CommandLine;
using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.Graph.Beta.Models;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Assignments;

public class AssignmentFiltersCmd : Command<FetchFiltersCommandOptions, FetchFiltersCommandHandler>
{
    public AssignmentFiltersCmd() : base(CommandConfiguration.AssignmentFilterCommandName, CommandConfiguration.AssignmentFilterCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.IdArg, CommandConfiguration.IdArgDescription));
    }
}

public class FetchFiltersCommandOptions : ICommandOptions
{
    public string Id { get; set; } = String.Empty;
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
        var idProvided = !string.IsNullOrWhiteSpace(options.Id);

        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }

        if (idProvided)
        {
            var result = await _assignmentFiltersService.GetAssignmentFilterInfoAsync(accessToken, options.Id);
            if (result is not null)
                results.Add(result);
        }
        else
        {
            results = await _assignmentFiltersService.GetAssignmentFiltersListAsync(accessToken);
        }

        if (results is not null)
        {
            var table = new Table();
            table.Collapse();
            table.AddColumn("Id");
            table.AddColumn("DisplayName");
            table.AddColumn("Rule");
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
        AnsiConsole.MarkupLine($"[yellow]No filters found in Intune, consider using filters. Using filters is a best practice.[/]");
        return -1;
    }
}
