using System.Runtime.InteropServices.JavaScript;
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
    public string FilterId { get; set; } = String.Empty;
    public string FilterType { get; set; } = "None";
}



public static class AssignmentModelExtensions
{
    public static AssignmentsModel ToAssignmentModel(this DeviceAndAppManagementAssignmentTarget? deviceTarget, GroupAssignmentTarget? groupTarget, string resourceId, string? modelString, string? resourceName)
    {
        string targetId = String.Empty;
        string pattern1 = "Microsoft.Graph.Beta.Models.";
        string pattern2 = "AssignmentTarget";
        string assignmentType = String.Empty;
        bool isAssigned = false;
        string filterId = String.Empty;
        string filterType = String.Empty; 
        string resourceType = "Type not found"; 
        if (groupTarget is not null)
        {
            targetId = "none";
            assignmentType = StringExtensions.GetStringBetweenTwoStrings(groupTarget.ToString(), pattern1, pattern2);
            isAssigned = !groupTarget.DeviceAndAppManagementAssignmentFilterType.ToString().IsNullOrEmpty();
            filterId = groupTarget.DeviceAndAppManagementAssignmentFilterId.IsNullOrEmpty() ? "No Filter" : groupTarget.DeviceAndAppManagementAssignmentFilterId;
            filterType = groupTarget.DeviceAndAppManagementAssignmentFilterType.ToString(); 
            if (groupTarget is GroupAssignmentTarget group)
            {
                targetId = group.GroupId;
            }
            if (modelString is not null)
                resourceType = ResourceHelper.GetResourceTypeFromOdata(modelString);
        }
        if (deviceTarget is not null)
        {
            isAssigned = !deviceTarget.DeviceAndAppManagementAssignmentFilterType.ToString().IsNullOrEmpty();
            assignmentType = StringExtensions.GetStringBetweenTwoStrings(deviceTarget.ToString(), pattern1, pattern2);
            filterId = deviceTarget.DeviceAndAppManagementAssignmentFilterId.IsNullOrEmpty() ? "No Filter" : deviceTarget.DeviceAndAppManagementAssignmentFilterId;
            filterType = deviceTarget.DeviceAndAppManagementAssignmentFilterType.ToString(); 

            if (modelString is not null)
                 resourceType = ResourceHelper.GetResourceTypeFromOdata(modelString);
            
        }
        return new AssignmentsModel
        {
            AssignmentType = assignmentType,
            IsAssigned = isAssigned,
            ResourceType = resourceType,
            ResourceId = resourceId,
            TargetId = targetId,
            ResourceName = resourceName,
            FilterId = filterId,
            FilterType = filterType
        };

    }
} 