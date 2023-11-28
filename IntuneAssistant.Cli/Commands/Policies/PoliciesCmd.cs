using System.CommandLine;
using IntuneAssistant.Helpers;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models;
using Microsoft.IdentityModel.Tokens;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Policies;

public class PoliciesCmd : Command<FetchPoliciesCommandOptions, FetchPoliciesCommandHandler>
{
    public PoliciesCmd() : base(CommandConfiguration.PoliciesCommandName, CommandConfiguration.PoliciesCommandDescription)
    {
        AddOption(new Option<bool>(CommandConfiguration.NonAssignedArg, CommandConfiguration.NonAssignedArgDescription));
        AddOption(new Option<bool>(CommandConfiguration.PoliciesConfigurationFilterName, CommandConfiguration.PoliciesConfigurationFilterDescription));
        AddOption(new Option<bool>(CommandConfiguration.PoliciesComplianceFilterName, CommandConfiguration.PoliciesComplianceFilterDescription));
    }
}

public class FetchPoliciesCommandOptions : ICommandOptions
{
    public bool NonAssigned { get; set; } = false;
    public bool ExcludeConfiguration { get; set; } = false;
    public bool ExcludeCompliance { get; set; } = false;
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
        var complianceResults = new List<DeviceCompliancePolicy>();
        var configurationResults = new List<ConfigurationPolicy>();
        var excludeConfiguration = options.ExcludeConfiguration;
        var excludeCompliance = options.ExcludeCompliance;
        var table = new Table();
        
        table.Collapse();
        table.AddColumn("Id");
        table.AddColumn("DeviceName");
        table.AddColumn("Assigned");
        table.AddColumn("PolicyType");
        table.AddColumn("AssignmentTarget");
        
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }
        if (!excludeCompliance)
            await AnsiConsole.Status().StartAsync("Fetching compliance policies from Intune",
                async _ =>
                {
                    complianceResults =
                        await _compliancePoliciesService.GetCompliancePoliciesListAsync(accessToken, assignmentFilter);
                });
        if (!excludeConfiguration)
            await AnsiConsole.Status().StartAsync("Fetching configuration policies from Intune",
                async _ =>
                {
                    configurationResults =
                        await _configurationPolicyService.GetConfigurationPoliciesListAsync(accessToken, assignmentFilter);
                });
        foreach (var policy in complianceResults)
        {
            var assignmentTypes = new List<string>();
            if (policy.OdataType == null) continue;
            var policyType = ResourceHelper.GetResourceTypeFromOdata(policy.OdataType);
            var assignmentInfo = new AssignmentInfoModel();
            if (policy.Assignments.IsNullOrEmpty())
            {
                assignmentTypes.Add("None");
            }
            else
            {
                if (policy.Assignments != null)
                    foreach (var assignment in policy.Assignments)
                    {
                        assignmentInfo = AssignmentInfoModelExtensions.ToAssignmentInfoModel(assignment.Target);
                        assignmentTypes.Add($"{assignmentInfo.AssignmentType} ({assignmentInfo.FilterType})");
                    }
            }
            table.AddRow(
                policy.Id,
                policy.DisplayName,
                assignmentInfo.IsAssigned.ToString(),
                policyType,
                string.Join(",",assignmentTypes)
            );
        }
        foreach (var policy in configurationResults)
        {
            var assignmentTypes = new List<string>();
            var policyType = ResourceHelper.GetResourceTypeFromOdata(policy.OdataType);
            var assignmentInfo = new AssignmentInfoModel();
            if (policy.Assignments.IsNullOrEmpty())
            {
                assignmentTypes.Add("None");
            }
            else
            {
                foreach (var assignment  in policy.Assignments)
                {
                    assignmentInfo = AssignmentInfoModelExtensions.ToAssignmentInfoModel(assignment.Target);
                    assignmentTypes.Add($"{assignmentInfo.AssignmentType} ({assignmentInfo.FilterType})");
                }   
            }
            table.AddRow(
                policy.Id,
                policy.Name,
                assignmentInfo.IsAssigned.ToString(),
                "Config",
                string.Join(",",assignmentTypes)
            );
        }
        AnsiConsole.Write(table);
        return 0;
    }
}