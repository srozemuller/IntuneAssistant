using System.CommandLine;
using IntuneAssistant.Constants;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.IdentityModel.Tokens;
using Spectre.Console;
using Newtonsoft.Json;

namespace IntuneAssistant.Cli.Commands.Policies.Configuration;

public class ConfigPoliciesExportCmd : Command<ExportConfigurationPoliciesCommandOptions,ExportConfigurationPoliciesCommandHandler>
{
    public ConfigPoliciesExportCmd() : base(CommandConfiguration.ExportCommandName, CommandConfiguration.ExportCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ExportPathArg, CommandConfiguration.ExportPathArgDescription));
    }
}


public class ExportConfigurationPoliciesCommandOptions : ICommandOptions
{
    public string ExportPath { get; set; } = string.Empty;
}


public class ExportConfigurationPoliciesCommandHandler : ICommandOptionsHandler<ExportConfigurationPoliciesCommandOptions>
{

    private readonly IConfigurationPolicyService _configurationPolicyService;
    private readonly IIdentityHelperService _identityHelperService;

    public ExportConfigurationPoliciesCommandHandler(IConfigurationPolicyService configurationPoliciesService, IIdentityHelperService identityHelperService)
    {
        _configurationPolicyService = configurationPoliciesService;
        _identityHelperService = identityHelperService;
    }
    public async Task<int> HandleAsync(ExportConfigurationPoliciesCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        
        var exportPath = options.ExportPath;
        if (exportPath.IsNullOrEmpty())
        {
            exportPath = AppConfiguration.DEFAULT_FOLDER;
        }
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }
        
        var allCompliancePoliciesResults = new List<ConfigurationPolicyModel>();
        // Show progress spinner while fetching data
        await AnsiConsole.Status().StartAsync("Fetching configuration policies from Intune", async _ =>
        {
            allCompliancePoliciesResults = await _configurationPolicyService.GetConfigurationPoliciesListAsync(accessToken);
        });
        
        var fullExportPath = $"{exportPath}/{AppConfiguration.CONFIGPOLICY_OUTPUTPREFIX}";
        if (!Directory.Exists(fullExportPath));
        {
            Directory.CreateDirectory(fullExportPath);
        }
        foreach (var policy in allCompliancePoliciesResults)
        {
            policy.CreatedDateTime = null;
            policy.LastModifiedDateTime = null;
            policy.Id = null;

            var policyString = JsonConvert.SerializeObject(policy,JsonSettings.Default());

            await File.WriteAllTextAsync($"{fullExportPath}/{policy.Name}.json", policyString);
        }

        AnsiConsole.Write($"Policies exported to {fullExportPath}");
        return 0;
    }
}