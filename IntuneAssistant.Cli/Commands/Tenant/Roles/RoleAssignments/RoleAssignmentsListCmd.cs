using System.CommandLine;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Tenant.Roles.RoleAssignments;


public class RoleAssignmentsListCmd : Command<FetchRolesAssignmentsListCommandOptions, FetchRoleAssignmentListCommandHandler>
{
    public RoleAssignmentsListCmd() : base(CommandConfiguration.ListCommandName, CommandConfiguration.ListCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
    }
}

public class FetchRolesAssignmentsListCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
}

public class FetchRoleAssignmentListCommandHandler : ICommandOptionsHandler<FetchRolesAssignmentsListCommandOptions>
{
    private readonly ITenantInformationService _tenantInformationService;
    private readonly IIdentityHelperService _identityHelperService;
    private readonly IGlobalGraphService _globalGraphService;

    public FetchRoleAssignmentListCommandHandler(ITenantInformationService tenantInformationService, IIdentityHelperService identityHelperService, IGlobalGraphService globalGraphService)
    {
        _tenantInformationService = tenantInformationService;
        _identityHelperService = identityHelperService;
        _globalGraphService = globalGraphService;
    }

    public async Task<int> HandleAsync(FetchRolesAssignmentsListCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        var assignments = new List<RoleAssignmentModel>();
        var roles = new List<RoleDefinitionModel>(); 
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }
        var exportCsvProvided = !string.IsNullOrWhiteSpace(options.ExportCsv);

        // Show progress spinner while fetching data
        await AnsiConsole.Status()
            .StartAsync("Fetching role assignments from Intune", async _ =>
            {
                roles = await _tenantInformationService.GetRoleDefinitionsListAsync(accessToken);
                if (roles is not null)
                {
                    assignments = await _tenantInformationService.GetRoleAssignmentsListAsync(accessToken, roles);
                }
            });

        if (exportCsvProvided)
        {
            ExportData.ExportCsv(assignments,options.ExportCsv);
            return 0;
        }
        if (assignments?.Count == 0)
        {
            AnsiConsole.MarkupLine("No roles found");
            return 0;
        }
        
        var table = new Table();
        table.Collapse();
        table.AddColumn("RoleId");
        table.AddColumn("RoleName");
        table.AddColumn("AssignmentName");
        table.AddColumn("EntraObjectID");
        table.AddColumn("EntraObjectName");
        table.AddColumn("Type");

        var assignmentIds = assignments.SelectMany(a => a.Members).Distinct().ToList();
        var allMembersInfo = _globalGraphService.GetDirectoryObjectsByIdListAsync(accessToken, assignmentIds);

        foreach (var assignment in assignments)
        {
            var roleName = roles.Find(i => i.Id == assignment.RoleId);
            foreach (var member in assignment.Members)
            {
                var memberInfo = allMembersInfo.Result.Find(m => m.Id == (string)member);
                table.AddRow(
                    assignment.Id,
                    roleName.DisplayName.EscapeMarkup(),
                    assignment.DisplayName,
                    memberInfo.Id,
                    memberInfo.DisplayName,
                    memberInfo.ODataType.ToHumanReadableString()
                );
            }
        }
        AnsiConsole.Write(table);
        return 0;
    }
}
