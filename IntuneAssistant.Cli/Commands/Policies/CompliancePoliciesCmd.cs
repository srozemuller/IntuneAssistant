using System.CommandLine;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.Graph.Beta.Models;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Policies;

public class CompliancePoliciesCmd : Command<FetchCompliancePoliciesCommandOptions, FetchCompliancePoliciesCommandHandler>
{
    public CompliancePoliciesCmd() : base(CommandConfiguration.CompliancePolicyCommandName, CommandConfiguration.CompliantPolicyCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.IdArg, CommandConfiguration.IdArgDescription));
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<bool>(CommandConfiguration.DeviceStatusCommandName, CommandConfiguration.DeviceStatusCommandDescription));
        AddOption(new Option<string>(CommandConfiguration.BackupArg, CommandConfiguration.BackupArgDescription));
    }
}

public class FetchCompliancePoliciesCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
    public string Id { get; set; } = string.Empty;
    public bool DeviceStatus { get; set; } = false;
    public string Backup { get; set; } = String.Empty;
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
        var policyId = options.Id;
        var deviceStatus = options.DeviceStatus;
        var backupArgProvided = options.Backup;
        var results = new DeviceCompliancePolicy();
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }
        if (policyId.IsNullOrEmpty())
        {
            throw new Exception("Please provide the policy id using --id");
        }

        if (deviceStatus)
        {
            var deviceStatusResults = await _compliancePoliciesService.GetCompliancePolicyDeviceStatusByIdAsync(accessToken, policyId);
            Console.Write(deviceStatusResults);
            return 0;
        }

        await AnsiConsole.Status().SpinnerStyle(Color.Orange1)
            .StartAsync(
                $"Fetching compliance policy from Intune",
                async _ =>
                {
                    results = await _compliancePoliciesService.GetCompliancePolicyByIdAsync(accessToken, options.Id)!;
                    
                });

        if (backupArgProvided.IsNullOrEmpty()){}
        {
            // Convert the object to JSON
            string jsonString = JsonConvert.SerializeObject(results);

            // Write the JSON string to a file
            File.WriteAllText("test.json", jsonString);
        }
        return 0;
    }
}
