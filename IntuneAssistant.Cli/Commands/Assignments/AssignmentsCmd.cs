using System.CommandLine;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Assignments;

public class AssignmentsCmd : Command<FetchAssignmentsCommandOptions, FetchAssignmentsCommandHandler>
{
    public AssignmentsCmd() : base(CommandConfiguration.AssignmentsCommandName, CommandConfiguration.AssignmentsCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<string>(CommandConfiguration.AssignmentsGroupIdCommandName, CommandConfiguration.AssignmentsGroupIdCommandDescription));
        AddOption(new Option<string>(CommandConfiguration.AssignmentsGroupNameCommandName, CommandConfiguration.AssignmentsGroupNameCommandDescription));
    }
}

public class FetchAssignmentsCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
    public string GroupId { get; set; } = string.Empty;
    public string GroupName { get; set; } = string.Empty;
}

public class FetchAssignmentsCommandHandler : ICommandOptionsHandler<FetchAssignmentsCommandOptions>
{

    private readonly IAssignmentsService _assignmentsService;
    private readonly IGroupInformationService _groupInformationService;
    private readonly IIdentityHelperService _identityHelperService;

    public FetchAssignmentsCommandHandler(IIdentityHelperService identityHelperService, IAssignmentsService assignmentsService, IGroupInformationService groupInformationService)
    {
        _assignmentsService = assignmentsService;
        _groupInformationService = groupInformationService;
        _identityHelperService = identityHelperService;
        
    }
    public async Task<int> HandleAsync(FetchAssignmentsCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        var results = new List<AssignmentsModel>();
        var exportCsv = !string.IsNullOrWhiteSpace(options.ExportCsv);
        var groupIdprovided = !string.IsNullOrWhiteSpace(options.GroupId);
        var groupName = !string.IsNullOrEmpty(options.GroupName);
        var groupInfo = new Microsoft.Graph.Beta.Models.Group();
        await AnsiConsole.Status()
                .StartAsync("Fetching group information from Entra ID",
                    async _ =>
                    {
                        if (groupIdprovided)
                        {
                            groupInfo = await _groupInformationService.GetGroupInformationByIdAsync(accessToken,
                                options.GroupId);
                        }
                        else
                        {
                            groupInfo = await _groupInformationService.GetGroupInformationByNameAsync(accessToken,
                                options.GroupName);
                        }
                    }); 
        if (groupInfo is not null)
            {
                await AnsiConsole.Status()
                    .StartAsync("Fetching assignments based on specific group from Intune",
                        async _ =>
                        {
                            results = await _assignmentsService.GetAssignmentsByGroupListAsync(accessToken, groupInfo);
                        });
            }
            else
            {
                AnsiConsole.MarkupLine($"[red]No group found![/]");
                return -1;
            }
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }

        if (results is not null)
        {
            var table = new Table();
            table.Collapse();
            table.AddColumn("ResourceType");
            table.AddColumn("ResourceId");
            table.AddColumn("ResourceName");
            table.AddColumn("AssignmentType");
            table.AddColumn("TargetId");
            table.AddColumn("GroupName");
            foreach (var filter in results)
            {
                table.AddRow(
                    filter.ResourceType,
                    filter.ResourceId,
                    filter.ResourceName,
                    filter.AssignmentType,
                    filter.TargetId,
                    groupInfo.DisplayName
                );
            
            }
            AnsiConsole.Write(table);
            return 0;
        }
        AnsiConsole.MarkupLine($"[yellow]No filters found in Intune, consider using filters. Using filters is a best practice.[/]");
        return -1;
    }
}
