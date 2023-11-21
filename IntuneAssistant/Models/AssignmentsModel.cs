using Azure.Core;
using IntuneAssistant.Extensions;
using IntuneAssistant.Helpers;
using Microsoft.Graph.Beta.Models;
using Microsoft.IdentityModel.Tokens;

namespace IntuneAssistant.Models;

public class AssignmentsModel
{
    public string ResourceType { get; set; } = String.Empty;
    public string AssignmentType { get; init; } = String.Empty;
    public bool IsAssigned { get; set; } = false;
    public string TargetId { get; set; } = String.Empty;
    public string ResourceId { get; set; } = String.Empty;
    public string ResourceName { get; set; } = String.Empty;
}



public static class AssignmentModelExtensions
{
    public static AssignmentsModel ToAssignmentModel(this DeviceAndAppManagementAssignmentTarget? target, string resourceId, string? modelString, string? resourceName, string targetId)
    {
        if (target is not null)
        {
            string targetType = target.DeviceAndAppManagementAssignmentFilterType.ToString();
            var isAssigned = !target.DeviceAndAppManagementAssignmentFilterType.ToString().IsNullOrEmpty();
            string pattern1 = "Microsoft.Graph.Beta.Models.";
            string pattern2 = "AssignmentTarget";
            string assignmentType = StringExtensions.GetStringBetweenTwoStrings(target.ToString(), pattern1, pattern2);
            string resourceType = "Type not found";
             if (modelString is not null)
                 resourceType = ResourceHelper.GetResourceTypeFromOdata(modelString);
            // //GroupAssignmentTarget 
            return new AssignmentsModel
            {
                AssignmentType = assignmentType,
                IsAssigned = isAssigned,
                ResourceType = resourceType,
                ResourceId = resourceId,
                TargetId = targetId,
                ResourceName = resourceName
            };
        }
        return new AssignmentsModel();
    }
} 