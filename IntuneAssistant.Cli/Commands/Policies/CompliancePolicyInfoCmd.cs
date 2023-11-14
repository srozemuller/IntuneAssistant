using System.CommandLine;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Cli.Fetches;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Policies;

public class CompliancePolicyInfoCmd : Command<FetchCompliancePolicyAssignmentCommandOptions, FetchCompliancePolicyAssignmentCommandHandler>
{
    public CompliancePolicyInfoCmd() : base(CommandConfiguration.PolicyIdArg, CommandConfiguration.PolicyIdArgDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.PolicyIdArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<bool>(CommandConfiguration.DeviceStatusCommandName, CommandConfiguration.DeviceStatusCommandDescription));
    }
}

public class FetchCompliancePolicyAssignmentCommandOptions : ICommandOptions
{
    public string Id { get; set; }
    public string ExportCsv { get; set; } = string.Empty;
    public bool DeviceStatus { get; set; } = false;

}

public class FetchCompliancePolicyAssignmentCommandHandler : ICommandOptionsHandler<FetchCompliancePolicyAssignmentCommandOptions>
{

    private readonly ICompliancePoliciesService _compliancePoliciesService;
    private readonly IIdentityHelperService _identityHelperService;

    public FetchCompliancePolicyAssignmentCommandHandler(ICompliancePoliciesService compliancePoliciesService, IIdentityHelperService identityHelperService)
    {
        _compliancePoliciesService = compliancePoliciesService;
        _identityHelperService = identityHelperService;
    }
    public async Task<int> HandleAsync(FetchCompliancePolicyAssignmentCommandOptions options)
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
        if (deviceStatus)
        {
            var table = await new ComplianceInfoFetch().DeviceStatus(accessToken, policyId, _compliancePoliciesService);
            AnsiConsole.Write(table);
        }
        return 0;
    }
}
