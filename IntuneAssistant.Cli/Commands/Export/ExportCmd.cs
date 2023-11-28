using System.CommandLine;
using IntuneAssistant.Helpers;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models;
using Microsoft.IdentityModel.Tokens;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Export;

public class ExportCmd : Command<FetchPoliciesCommandOptions, FetchPoliciesCommandHandler>
{
    public ExportCmd() : base(CommandConfiguration.PoliciesCommandName, CommandConfiguration.PoliciesCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<bool>(CommandConfiguration.NonAssignedArg, CommandConfiguration.NonAssignedArgDescription));
        AddOption(new Option<bool>(CommandConfiguration.PoliciesConfigurationFilterName, CommandConfiguration.PoliciesConfigurationFilterDescription));
        AddOption(new Option<bool>(CommandConfiguration.PoliciesComplianceFilterName, CommandConfiguration.PoliciesComplianceFilterDescription));
    }
}

public class FetchPoliciesCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
    public bool NonAssigned { get; set; } = false;

    public bool IncludeConfiguration { get; set; }
    public bool IncludeCompliance { get; set; }
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
        var complianceResults = new List<DeviceCompliancePolicy>();
        var configurationResults = new List<ConfigurationPolicy>();
        var returnConfiguration = options.IncludeConfiguration;
        var returnCompliance = options.IncludeCompliance;
        var table = new Table();

        if (!returnConfiguration && !returnCompliance)
        {
            AnsiConsole.MarkupLine("[red]Please tell me what you want by providing commands like --include-compliance, for all options use -h[/]");
            return -1;
        }
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
        if (returnCompliance)
            await AnsiConsole.Status().StartAsync("Fetching compliance policies from Intune",
                async _ =>
                {
                    complianceResults =
                        await _compliancePoliciesService.GetCompliancePoliciesListAsync(accessToken, assignmentFilter);
                });
        if (returnConfiguration)
            await AnsiConsole.Status().StartAsync("Fetching configuration policies from Intune",
                async _ =>
                {
                    configurationResults =
                        await _configurationPolicyService.GetConfigurationPoliciesListAsync(accessToken, assignmentFilter);
                });
        foreach (var policy in complianceResults)
        {
            var assignmentTypes = new List<string>();
            string policyType = ResourceHelper.GetResourceTypeFromOdata(policy.OdataType);
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
                policy.DisplayName,
                assignmentInfo.IsAssigned.ToString(),
                policyType,
                string.Join(",",assignmentTypes)
            );
        }
        foreach (var policy in configurationResults)
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