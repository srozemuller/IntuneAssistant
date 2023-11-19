using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class AssignmentsService : IAssignmentsService
{
    public async Task<List<AssignmentsModel>?> GetAssignmentsByGroupListAsync(string accessToken, Group group)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var polResults = new DeviceCompliancePolicyCollectionResponse();
        var policiesWithGroupAssignments = new List<DeviceCompliancePolicy>();
        var configPoliciesWithGroupAssignments = new List<DeviceManagementConfigurationPolicy>();
        var configPolResults = new DeviceManagementConfigurationPolicyCollectionResponse();
        var results = new List<AssignmentsModel>();
        var assignmentInfo = new AssignmentsModel();
        try
        {
            polResults = await graphClient.DeviceManagement.DeviceCompliancePolicies.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });
            //policiesWithGroupAssignments = polResults.Value.SelectMany(r => r.Assignments.Where(a => a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget" && a.Id.Contains(group.Id))).ToList();
            policiesWithGroupAssignments = polResults.Value.Where(r=> r.Assignments.Any(t => t.Target.OdataType == "#microsoft.graph.groupAssignmentTarget" && t.Id.Contains(group.Id))).ToList();

            foreach (var policy in policiesWithGroupAssignments)
            {
                List<DeviceCompliancePolicyAssignment> assignments = policy.Assignments.Where(a =>
                    a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget" && a.Id.Contains(group.Id)).ToList();
                foreach (var assignment in assignments)
                {
                    assignmentInfo = AssignmentModelExtensions.ToAssignmentModel(assignment.Target, assignment.Id, policy.ToString(), policy.DisplayName
                    );
                    results.Add(assignmentInfo);
                }

            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
            return null;
        }
        try
        {
            configPolResults = await graphClient.DeviceManagement.ConfigurationPolicies.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });
            //policiesWithGroupAssignments = polResults.Value.SelectMany(r => r.Assignments.Where(a => a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget" && a.Id.Contains(group.Id))).ToList();
            configPoliciesWithGroupAssignments = configPolResults.Value.Where(r=> r.Assignments.Any(t => t.Target.OdataType == "#microsoft.graph.groupAssignmentTarget" && t.Id.Contains(group.Id))).ToList();

            foreach (var policy in configPoliciesWithGroupAssignments)
            {
                List<DeviceManagementConfigurationPolicyAssignment> assignments = policy.Assignments.Where(a =>
                    a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget" && a.Id.Contains(group.Id)).ToList();
                foreach (var assignment in assignments)
                {
                    assignmentInfo = AssignmentModelExtensions.ToAssignmentModel(assignment.Target, assignment.Id, policy.ToString(), policy.Name
                    );
                    results.Add(assignmentInfo);
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching compliance policies: " + ex.ToMessage());
            return null;
        }
        return results;
    }
    
    public async Task<List<AssignmentsModel>?> GetAssignmentsListAsync(string accessToken)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var polResults = new DeviceCompliancePolicyCollectionResponse();
        var configPolResults = new DeviceManagementConfigurationPolicyCollectionResponse();
        var policiesWithGroupAssignments = new List<DeviceCompliancePolicy>();
        var results = new List<AssignmentsModel>();
        var assignmentInfo = new AssignmentsModel();
        try
        {
            polResults = await graphClient.DeviceManagement.DeviceCompliancePolicies.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });
            //policiesWithGroupAssignments = polResults.Value.SelectMany(r => r.Assignments.Where(a => a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget" && a.Id.Contains(group.Id))).ToList();
            policiesWithGroupAssignments = polResults.Value.Where(r=> r.Assignments.Any(t => t.Target.OdataType == "#microsoft.graph.groupAssignmentTarget")).ToList();

            foreach (var policy in policiesWithGroupAssignments)
            {
                List<DeviceCompliancePolicyAssignment> assignments = policy.Assignments.Where(a =>
                    a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget").ToList();
                foreach (var assignment in assignments)
                {
                    assignmentInfo = AssignmentModelExtensions.ToAssignmentModel(assignment.Target, assignment.Id, policy.ToString(), policy.DisplayName
                    );
                    results.Add(assignmentInfo);
                }

            }

        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching compliance policies: " + ex.ToMessage());
            return null;
        }
        try
        {
            configPolResults = await graphClient.DeviceManagement.ConfigurationPolicies.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });
            //policiesWithGroupAssignments = polResults.Value.SelectMany(r => r.Assignments.Where(a => a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget" && a.Id.Contains(group.Id))).ToList();
            policiesWithGroupAssignments = polResults.Value.Where(r=> r.Assignments.Any(t => t.Target.OdataType == "#microsoft.graph.groupAssignmentTarget")).ToList();

            foreach (var policy in policiesWithGroupAssignments)
            {
                List<DeviceCompliancePolicyAssignment> assignments = policy.Assignments.Where(a =>
                    a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget").ToList();
                foreach (var assignment in assignments)
                {
                    assignmentInfo = AssignmentModelExtensions.ToAssignmentModel(assignment.Target, assignment.Id, policy.ToString(), policy.DisplayName
                    );
                    results.Add(assignmentInfo);
                }

            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching compliance policies: " + ex.ToMessage());
            return null;
        }
        return results;
    }
}
