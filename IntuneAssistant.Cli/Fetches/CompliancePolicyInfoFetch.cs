using IntuneAssistant.Infrastructure.Interfaces;
using Microsoft.Graph.Beta.Models;
using Microsoft.IdentityModel.Tokens;
using Spectre.Console;

namespace IntuneAssistant.Cli.Fetches;

public class ComplianceInfoFetch {

    public async Task<Table> DeviceStatus(string accessToken, string policyId, ICompliancePoliciesService compliancePoliciesService)
    {
        // Microsoft Graph
        // Implementation of shared service from infrastructure comes here
        var result = new DeviceComplianceDeviceStatusCollectionResponse();
        // Show progress spinner while fetching data
        await AnsiConsole.Status().StartAsync("Fetching compliance policy assignment from Intune", async _ =>
        {
            result = await compliancePoliciesService.GetCompliancePolicyDeviceStatusAsync(accessToken, policyId);
            return result.Value;
        });
        var table = new Table();
        table.Collapse();
        table.AddColumn("UserName");
        table.AddColumn("DisplayName");
        table.AddColumn("Status");
        table.AddColumn("Platform");
        if (result.Value is not null)
        {
            foreach (var r in result.Value)
            {
                table.AddRow(
                    r.UserPrincipalName,
                    r.DeviceDisplayName,
                    r.Status.Value.ToString(),
                    r.Platform.Value.ToString()
                );
            }
        }
        return table;
    }

    public async Task<Table> AssignmentInfo(string accessToken, string policyId, ICompliancePoliciesService compliancePoliciesService)
    {

                    // Microsoft Graph
                    // Implementation of shared service from infrastructure comes here
                    var allCompliancePoliciesResults = new List<DeviceCompliancePolicy>();
                    var policies = new List<DeviceCompliancePolicy>();
                    var isAssigned = new bool();
                    // Show progress spinner while fetching data
                    await AnsiConsole.Status().StartAsync("Fetching compliance policies from Intune", async _ =>
                    {
                        allCompliancePoliciesResults = await compliancePoliciesService.GetCompliancePoliciesListAsync(accessToken);

                            policies.AddRange(allCompliancePoliciesResults.Where(p => p.Assignments.IsNullOrEmpty()));

                    });
                        
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
                            policy.DisplayName,
                            isAssigned.ToString(),
                            "Compliance"
                        );
                    }
                    return table;
    }
}