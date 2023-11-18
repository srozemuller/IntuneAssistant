using System.CommandLine;
using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.Graph.Beta.Models;
using Microsoft.IdentityModel.Tokens;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Policies;

public class CompliancePoliciesCmd : Command<FetchCompliancePoliciesCommandOptions, FetchCompliancePoliciesCommandHandler>
{
    public CompliancePoliciesCmd() : base(CommandConfiguration.CompliancePolicyCommandName, CommandConfiguration.CompliantPolicyCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.IdArg, CommandConfiguration.IdArgDescription));
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<bool>(CommandConfiguration.DeviceStatusCommandName, CommandConfiguration.DeviceStatusCommandDescription));
    }
}

public class FetchCompliancePoliciesCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
    public string Id { get; set; } = string.Empty;
    public bool DeviceStatus { get; set; } = false;
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
        var results = new DeviceComplianceDeviceStatusCollectionResponse();
        var exportCsv = !string.IsNullOrWhiteSpace(options.ExportCsv);
        var policyId = options.Id;
        var deviceStatus = options.DeviceStatus;
        
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
            results = await _compliancePoliciesService.GetCompliancePolicyDeviceStatusAsync(accessToken, policyId);
            Console.Write(results);
        }
        return 0;
    }
}
