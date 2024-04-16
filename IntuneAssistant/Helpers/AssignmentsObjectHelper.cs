using IntuneAssistant.Enums;
using IntuneAssistant.Extensions;
using IntuneAssistant.Models;
using IntuneAssistant.Models.Group;
using Microsoft.IdentityModel.Tokens;


namespace IntuneAssistant.Helpers;

public class AssignmentsHelper
{
    public static class BatchResultToAssignments
    {
        public static List<CustomAssignmentsModel> CreateOutput(
            GraphBatchResponse<InnerResponseForAssignments<Assignment>> result,
            List<GlobalResourceModel> sourceResources, GroupModel? group)
        {
            var results = new List<CustomAssignmentsModel>();
            var responsesWithNoValue = result.Responses.Where(r => r.Body.Value.IsNullOrEmpty()).ToList();
            foreach (var nonAssigned in responsesWithNoValue)
            {
                var policyId = nonAssigned.Body.ODataContext.FetchIdFromContext();
                var sourcePolicy = sourceResources.FirstOrDefault(p =>
                    nonAssigned != null &&
                    p.Id == policyId);
                AssignmentsResponseModel resource = new AssignmentsResponseModel
                {
                    Id = sourcePolicy?.Id,
                    DisplayName = sourcePolicy?.DisplayName,
                    Assignments = new List<Assignment>()
                };
                var assignmentResponse =
                    resource.Assignments.FirstOrDefault()
                        .ToAssignmentModel(resource, ResourceTypes.ConfigurationPolicy);
                results.Add(assignmentResponse);
            }

            var responsesWithValue = result.Responses.Where(r => r.Body.Value.Any()).ToList();
            foreach (var assignmentResponse in responsesWithValue.Select(r => r.Body.Value))
            {
                var sourcePolicy = sourceResources.FirstOrDefault(p =>
                    assignmentResponse != null &&
                    p.Id == assignmentResponse.Select(a => a.SourceId).FirstOrDefault());
                if (sourcePolicy is null)
                {
                    var sourceId = assignmentResponse.Select(a => a.Id.Split('_')[0]);
                    sourcePolicy = sourceResources.FirstOrDefault(p =>
                        assignmentResponse != null &&
                        p.Id == sourceId.FirstOrDefault());
                }

                AssignmentsResponseModel resource = new AssignmentsResponseModel
                {
                    Id = sourcePolicy?.Id,
                    DisplayName = sourcePolicy?.DisplayName,
                    Assignments = assignmentResponse.Select(a => a).ToList()
                };
                if (group is null)
                {
                    foreach (var assignment in resource.Assignments)
                    {
                        var configurationPolicyAssignment =
                            assignment.ToAssignmentModel(resource, ResourceTypes.ConfigurationPolicy);
                        results.Add(configurationPolicyAssignment);
                    }
                }
                else
                    foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                    {
                        var configurationPolicyAssignment =
                            assignment.ToAssignmentModel(resource, ResourceTypes.ConfigurationPolicy);
                        results.Add(configurationPolicyAssignment);
                    }
            }
            return results;
        }
    }
    public static List<GlobalResourceModel> ConvertToGlobalResources(List<dynamic> result)
    {
        var globalResources = result.Select(response => new GlobalResourceModel
        {
            Id = response.Id,
            DisplayName = response.DisplayName
        }).ToList();
        return globalResources;
    }
    public class GlobalResourceModel
    {
        public string Id { get; set; }
        public string DisplayName { get; set; }
    }
}