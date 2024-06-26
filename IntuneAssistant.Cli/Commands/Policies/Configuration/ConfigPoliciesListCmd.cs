using System.CommandLine;
using IntuneAssistant.Enums;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Graph.Beta.Models;
using Microsoft.IdentityModel.Tokens;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Policies.Configuration;

public class ConfigPoliciesListCmd : Command<FetchConfigurationPoliciesCommandOptions,FetchConfigurationPoliciesCommandHandler>
{
    public ConfigPoliciesListCmd() : base(CommandConfiguration.ListCommandName, CommandConfiguration.ListCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.IdArg, CommandConfiguration.IdArgDescription));
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<bool>(CommandConfiguration.DeviceStatusCommandName, CommandConfiguration.DeviceStatusCommandDescription));
    }
}


public class FetchConfigurationPoliciesCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
    public bool NonAssigned { get; set; } = false;
}


public class FetchConfigurationPoliciesCommandHandler : ICommandOptionsHandler<FetchConfigurationPoliciesCommandOptions>
{

    private readonly IConfigurationPolicyService _configurationPolicyService;
    private readonly IIdentityHelperService _identityHelperService;
    private readonly ILogger _logger;

    public FetchConfigurationPoliciesCommandHandler(ILogger logger, IConfigurationPolicyService configurationPoliciesService, IIdentityHelperService identityHelperService)
    {
        _configurationPolicyService = configurationPoliciesService;
        _identityHelperService = identityHelperService;
        _logger = logger;
    }
    public async Task<int> HandleAsync(FetchConfigurationPoliciesCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }
        var exportCsv = !string.IsNullOrWhiteSpace(options.ExportCsv);
        // Microsoft Graph
        // Implementation of shared service from infrastructure comes here
        var allCompliancePoliciesResults = new List<ConfigurationPolicyModel>();
        // Show progress spinner while fetching data
        await AnsiConsole.Status().StartAsync("Fetching configuration policies from Intune", async _ =>
        {
            allCompliancePoliciesResults = await _configurationPolicyService.GetConfigurationPoliciesListAsync(accessToken);
        });
        if (allCompliancePoliciesResults.IsNullOrEmpty())
        {
            AnsiConsole.MarkupLine("No configuration policies found in Intune");
            _logger.LogError("No configuration policies found in Intune");

            return 0;
        }
        var table = new Table();
        table.Collapse();
        table.AddColumn("Id");
        table.AddColumn("DeviceName");
        table.AddColumn("Assigned");
        table.AddColumn("PolicyType");

        table.AddColumn("AssignmentTarget (filter)");
        table.AddColumn("AssignmentTarget");
        if (options.NonAssigned)
        {
            allCompliancePoliciesResults = allCompliancePoliciesResults.Where(obj => obj.Assignments == null || !obj.Assignments.Any()).ToList();
        }
        if (exportCsv)
        {
            ExportData.ExportCsv(allCompliancePoliciesResults,options.ExportCsv);
        }
        foreach (var policy in allCompliancePoliciesResults)
        {
            var assignmentTypes = new List<string>();
            var isAssigned = true;
            
            if (policy.Assignments.IsNullOrEmpty())
            {
                assignmentTypes.Add("None");
                isAssigned = false;
            }
            else
            {
                foreach (var assignment in policy.Assignments)
                {
                    if (assignment.Target.OdataType.Length > 0)
                    {
                        var type = assignment.Target.OdataType.ToHumanReadableString();
                        assignmentTypes.Add($"{type} ({assignment.Target.DeviceAndAppManagementAssignmentFilterType})");
                    }
                }   
            }

            table.AddRow(
                policy.Id,
                policy.Name.EscapeMarkup(),
                isAssigned.ToString(),
                ResourceTypes.ConfigurationPolicy.ToString(),
                string.Join(",",assignmentTypes)
            );
        }

        AnsiConsole.Write(table);
        return 0;
    }
}