using System.CommandLine;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models.Options;
using Microsoft.Graph.Beta.Models;
using Microsoft.IdentityModel.Tokens;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Policies;

public class GetCompliancePoliciesCommand : Command<FetchCompliancePoliciesCommandOptions, FetchCompliancePoliciesCommandHandler>
{
    public GetCompliancePoliciesCommand() : base(CommandConfiguration.PoliciesCommandName, CommandConfiguration.PoliciesCommandDescription)
    {
        AddOption(new Option<bool>(CommandConfiguration.NonAssignedArg, CommandConfiguration.NonAssignedArg));
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
    }
}

public class FetchCompliancePoliciesCommandOptions : ICommandOptions
{
    public bool NonAssigned { get; set; } = false;
    public string ExportCsv { get; set; } = string.Empty;
    
}

public class FetchCompliancePoliciesCommandHandler : ICommandOptionsHandler<FetchCompliancePoliciesCommandOptions>
{

    private readonly ICompliancePoliciesService _compliancePoliciesService;
    private readonly IIdentityHelperService _identityHelperService;

    public FetchCompliancePoliciesCommandHandler(ICompliancePoliciesService compliancePoliciesService, IIdentityHelperService identityHelperService)
    {
        _compliancePoliciesService = compliancePoliciesService;
        _identityHelperService = identityHelperService;
    }
    public async Task<int> HandleAsync(FetchCompliancePoliciesCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        var policies = new List<DeviceCompliancePolicy>();
        var isAssigned = new bool();
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }
        var exportCsv = !string.IsNullOrWhiteSpace(options.ExportCsv);
        var nonAssigned = options.NonAssigned;
        // Microsoft Graph
        // Implementation of shared service from infrastructure comes here
        var allCompliancePoliciesResults = new List<DeviceCompliancePolicy>();
        // Show progress spinner while fetching data
        await AnsiConsole.Status().StartAsync("Fetching compliance policies from Intune", async _ =>
        {
            allCompliancePoliciesResults = await _compliancePoliciesService.GetCompliancePoliciesListAsync(accessToken);
            if (nonAssigned)
            {
                policies.AddRange(allCompliancePoliciesResults.Where(p => p.Assignments.IsNullOrEmpty()));
            }
            else
            {
                policies.AddRange(allCompliancePoliciesResults);
            }
        });

        if (exportCsv)
        {
            ExportData.ExportCsv(allCompliancePoliciesResults,options.ExportCsv);
        }
        var table = new Table();
        table.Collapse();
        table.AddColumn("Id");
        table.AddColumn("DeviceName");
        table.AddColumn("Assigned");
        table.AddColumn("PolicyType");
        foreach (var policy in policies)
        {
            if (policy.Assignments.IsNullOrEmpty())
            {
                isAssigned = false;
            }
            else
            {
                isAssigned = true;
            }
            table.AddRow(
                policy.Id,
                policy.DisplayName,
                isAssigned.ToString(),
                "Compliance"
            );
        }

        AnsiConsole.Write(table);
        return 0;
    }
}
