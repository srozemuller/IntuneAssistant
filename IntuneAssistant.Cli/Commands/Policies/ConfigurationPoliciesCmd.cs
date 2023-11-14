using System.CommandLine;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.Graph.Beta.Models;
using Microsoft.IdentityModel.Tokens;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Show;

public class ConfigurationPoliciesCmd : Command<FetchConfigurationPoliciesCommandOptions,FetchConfigurationPoliciesCommandHandler>
{
    public ConfigurationPoliciesCmd() : base(CommandConfiguration.ConfigurationPolicyCommandName, CommandConfiguration.ConfigurationPolicyCommandDescription)
    {
        AddOption(new Option<bool>(CommandConfiguration.NonAssignedArg, CommandConfiguration.NonAssignedArgDescription));
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
    }
}


public class FetchConfigurationPoliciesCommandOptions : ICommandOptions
{
    public bool NonAssigned { get; set; } = false;
    public string ExportCsv { get; set; } = string.Empty;
    
}


public class FetchConfigurationPoliciesCommandHandler : ICommandOptionsHandler<FetchConfigurationPoliciesCommandOptions>
{

    private readonly IConfigurationPolicyService _configurationPolicyService;
    private readonly IIdentityHelperService _identityHelperService;

    public FetchConfigurationPoliciesCommandHandler(IConfigurationPolicyService configurationPoliciesService, IIdentityHelperService identityHelperService)
    {
        _configurationPolicyService = configurationPoliciesService;
        _identityHelperService = identityHelperService;
    }
    public async Task<int> HandleAsync(FetchConfigurationPoliciesCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        var policies = new List<DeviceManagementConfigurationPolicy>();
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
        var allCompliancePoliciesResults = new List<DeviceManagementConfigurationPolicy>();
        // Show progress spinner while fetching data
        await AnsiConsole.Status().StartAsync("Fetching configuration policies from Intune", async _ =>
        {
            allCompliancePoliciesResults = await _configurationPolicyService.GetConfigurationPoliciesListAsync(accessToken);
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
                policy.Name,
                isAssigned.ToString(),
                "Configuration"
            );
        }

        AnsiConsole.Write(table);
        return 0;
    }
}