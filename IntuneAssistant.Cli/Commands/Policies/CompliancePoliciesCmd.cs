using System.CommandLine;
using IntuneAssistant.Cli.Fetches;
using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.Graph.Beta.Models;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Policies;

public class CompliancePoliciesCmd : Command<FetchCompliancePoliciesCommandOptions, FetchCompliancePoliciesCommandHandler>
{
    public CompliancePoliciesCmd() : base(CommandConfiguration.CompliancePolicyCommandName, CommandConfiguration.CompliantPolicyCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.PolicyIdArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<bool>(CommandConfiguration.NonAssignedArg, CommandConfiguration.NonAssignedArgDescription));
        AddOption(new Option<bool>(CommandConfiguration.DeviceStatusCommandName, CommandConfiguration.DeviceStatusCommandDescription));
    }
}

public class FetchCompliancePoliciesCommandOptions : ICommandOptions
{
    public bool NonAssigned { get; set; } = false;
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
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }
        var exportCsv = !string.IsNullOrWhiteSpace(options.ExportCsv);
        var policyId = options.Id;
        var deviceStatus = options.DeviceStatus;
        var nonAssigned = options.NonAssigned;
        if (nonAssigned)
        {
            var table = await new ComplianceInfoFetch().AssignmentInfo(accessToken, policyId,
                _compliancePoliciesService);
        }
        if (deviceStatus)
        {
            var table = await new ComplianceInfoFetch().DeviceStatus(accessToken, policyId, _compliancePoliciesService);
            AnsiConsole.Write(table);
        }
        return 0;
    }
}
