using System.CommandLine;
using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.Graph.Beta.Models;
using Microsoft.IdentityModel.Tokens;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Policies;

public class PoliciesCmd : Command<FetchPoliciesCommandOptions, FetchPoliciesCommandHandler>
{
    public PoliciesCmd() : base(CommandConfiguration.PoliciesCommandName, CommandConfiguration.PoliciesCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<bool>(CommandConfiguration.NonAssignedArg, CommandConfiguration.NonAssignedArgDescription));
    }
}

public class FetchPoliciesCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
    public bool NonAssigned { get; set; } = false;
}

public class FetchPoliciesCommandHandler : ICommandOptionsHandler<FetchPoliciesCommandOptions>
{

    private readonly ICompliancePoliciesService _compliancePoliciesService;
    private readonly IIdentityHelperService _identityHelperService;
    private readonly IConfigurationPolicyService _configurationPolicyService;

    public FetchPoliciesCommandHandler(ICompliancePoliciesService compliancePoliciesService, IIdentityHelperService identityHelperService, IConfigurationPolicyService configurationPolicyService)
    {
        _compliancePoliciesService = compliancePoliciesService;
        _identityHelperService = identityHelperService;
        _configurationPolicyService = configurationPolicyService;
    }
    public async Task<int> HandleAsync(FetchPoliciesCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        var assignmentFilter = options.NonAssigned;
        var exportCsv = !string.IsNullOrWhiteSpace(options.ExportCsv);
        var isAssigned = new bool();
        var complianceResults = new List<DeviceCompliancePolicy>();
        var configurationResults = new List<DeviceManagementConfigurationPolicy>();
        var table = new Table();
        table.Collapse();
        table.AddColumn("Id");
        table.AddColumn("PolicyName");
        table.AddColumn("Assigned");
        table.AddColumn("PolicyType");
        
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }

        await AnsiConsole.Status().StartAsync("Fetching compliance policies from Intune",
            async _ =>
            {
                complianceResults =
                    await _compliancePoliciesService.GetCompliancePoliciesListAsync(accessToken, assignmentFilter);
            });
        await AnsiConsole.Status().StartAsync("Fetching configuration policies from Intune",
            async _ =>
            {
                configurationResults =
                    await _configurationPolicyService.GetConfigurationPoliciesListAsync(accessToken, assignmentFilter);
            });
        foreach (var policy in complianceResults)
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
        foreach (var policy in configurationResults)
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
                policy.Name,
                isAssigned.ToString(),
                "Configuration"
            );
        }

            AnsiConsole.Write(table);
        
        return 0;
    }
}