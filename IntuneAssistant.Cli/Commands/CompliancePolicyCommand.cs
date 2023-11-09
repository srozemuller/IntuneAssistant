using System.CommandLine;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.Graph.Beta.Models;
using Microsoft.IdentityModel.Tokens;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands;

public class CompliancePolicyCommand : Command<FetchCompliancePoliciesCommandOptions, FetchCompliancePoliciesCommandHandler>
{
    public CompliancePolicyCommand() : base("compliance-policies", "Fetches compliance policies from Intune")
    {
        AddOption(new Option<string>(Constants.ExportCsvArg, Constants.ExportCsvArgDescription));
    }
}

public class FetchCompliancePoliciesCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
}

public class FetchCompliancePoliciesCommandHandler : ICommandOptionsHandler<FetchCompliancePoliciesCommandOptions>
{

    private readonly ICompliancePoliciesService _compliancePoliciesService;

    public FetchCompliancePoliciesCommandHandler(ICompliancePoliciesService compliancePoliciesService)
    {
        _compliancePoliciesService = compliancePoliciesService;
    }
    public async Task<int> HandleAsync(FetchCompliancePoliciesCommandOptions options)
    {
        var exportCsv = !string.IsNullOrWhiteSpace(options.ExportCsv);
        // Microsoft Graph
        // Implementation of shared service from infrastructure comes here
        var compliancePolicies = new List<DeviceCompliancePolicy?>();
        // Show progress spinner while fetching data
        await AnsiConsole.Status().StartAsync("Fetching compliance policies from Intune", async _ =>
        {
            var allCompliancePoliciesResults = await _compliancePoliciesService.GetCompliancePoliciesListAsync("");
            if (allCompliancePoliciesResults is not null)
            {
                compliancePolicies.AddRange(allCompliancePoliciesResults.ToList());
            }
        });

        if (exportCsv)
        {
            ExportData.ExportCsv(compliancePolicies,options.ExportCsv);
        }
        var table = new Table();
        table.Collapse();
        table.AddColumn("Id");
        table.AddColumn("DeviceName");
        table.AddColumn("Assigned");

        foreach (var policy in compliancePolicies.Where(policy => policy is not null))
        {

            var assignmentList = await _compliancePoliciesService.GetCompliancePolicyAssignmentListAsync("", policy.Id);
            bool isAssigned = !assignmentList.IsNullOrEmpty();
            table.AddRow(
                policy.Id,
                policy.DisplayName,
                isAssigned.ToString()
            );
        }

        AnsiConsole.Write(table);
        return 0;
    }
}
