using System.CommandLine;
using IntuneAssistant.Extensions;
using IntuneAssistant.Helpers;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Policies;

public class ConfigurationPoliciesCmd : Command<FetchConfigurationPoliciesCommandOptions,FetchConfigurationPoliciesCommandHandler>
{
    public ConfigurationPoliciesCmd() : base(CommandConfiguration.ConfigurationPolicyCommandName, CommandConfiguration.ConfigurationPolicyCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.IdArg, CommandConfiguration.IdArgDescription));
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<bool>(CommandConfiguration.DeviceStatusCommandName, CommandConfiguration.DeviceStatusCommandDescription));
        AddOption(new Option<string>(CommandConfiguration.BackupArg, CommandConfiguration.BackupArgDescription));
    }
}


public class FetchConfigurationPoliciesCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
    public string Id { get; set; } = string.Empty;
    public bool DeviceStatus { get; set; } = false;
    public string Backup { get; set; } = String.Empty;
    
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
        var idProvided = !options.Id.IsNullOrEmpty();
        var backupArgProvided = options.Backup;
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }
        var exportCsv = !string.IsNullOrWhiteSpace(options.ExportCsv);
        if (idProvided)
        {
            var results = new ConfigurationPolicy();
            await AnsiConsole.Status().SpinnerStyle(Color.Orange1)
                .StartAsync(
                    $"Fetching configuration policy from Intune",
                    async _ =>
                    {
                        results =
                            await _configurationPolicyService.GetConfigurationPolicyByIdAsync(accessToken, options.Id)!;
                    });

            if (!backupArgProvided.IsNullOrEmpty())
            {
                var settingsResults = new ConfigurationPolicy();
                await AnsiConsole.Status().SpinnerStyle(Color.Orange1)
                    .StartAsync(
                        $"Fetching configuration policy with settings from Intune",
                        async _ =>
                        {
                            settingsResults =
                                await _configurationPolicyService.GetConfigurationPolicySettingsByIdAsync(accessToken, options.Id)!;
                        });
                var settingsString = JsonHelper.ObjectToJson(settingsResults);
                // Write the JSON string to a file
                File.WriteAllText($"{settingsResults.Name}.json", settingsString.ToString());
                return 0;
            }
        }

        // Microsoft Graph
        // Implementation of shared service from infrastructure comes here
        var allCompliancePoliciesResults = new List<ConfigurationPolicy>();
        // Show progress spinner while fetching data
        await AnsiConsole.Status().StartAsync("Fetching configuration policies from Intune", async _ =>
        {
            allCompliancePoliciesResults = await _configurationPolicyService.GetConfigurationPoliciesListAsync(accessToken, false);
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
        table.AddColumn("AssignmentTarget");
        foreach (var policy in allCompliancePoliciesResults)
        {
            // var assignmentTypes = new List<string>();
            // string policyType;
            // var assignmentInfo = new AssignmentInfoModel();
            // if (policy.TemplateReference.TemplateFamily is not null)
            // {
            //     policyType = policy.TemplateReference.TemplateFamily.Value.ToString();
            // }
            // else
            // {
            //     policyType = policy.TemplateReference.ToString();
            // }
            // if (policy.Assignments.IsNullOrEmpty())
            // {
            //     assignmentTypes.Add("None");
            // }
            // else
            // {
            //     foreach (var assignment  in policy.Assignments)
            //     {
            //         assignmentInfo = AssignmentInfoModelExtensions.ToAssignmentInfoModel(assignment.Target);
            //         assignmentTypes.Add($"{assignmentInfo.AssignmentType} ({assignmentInfo.FilterType})");
            //     }   
            // }
            // table.AddRow(
            //     policy.Id,
            //     policy.Name,
            //     assignmentInfo.IsAssigned.ToString(),
            //     policyType,
            //     string.Join(",",assignmentTypes)
            // );
        }

        AnsiConsole.Write(table);
        return 0;
    }
}