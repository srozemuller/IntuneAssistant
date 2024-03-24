using IntuneAssistant.Constants;
using IntuneAssistant.Models;

namespace IntuneAssistant.Extensions;

public static class AssignmentInformationExtension
{
    public static CustomAssignmentsModel ToCustomAssignmentsModel<T>(this IAssignment assignment, string resourceType, string? resourceName, string resourceId)
    {
        string targetId = String.Empty;
        string pattern2 = "AssignmentTarget";
        string assignmentType = assignment.Target.OdataType;
        string filterId = "No filter";
        if (assignment.Target.DeviceAndAppManagementAssignmentFilterId is not null)
        {
            filterId = assignment.Target.DeviceAndAppManagementAssignmentFilterId;
        }

        string filterType = String.Empty;
        if (assignmentType.StartsWith(AppConfiguration.STRINGTOREMOVE))
        {
            assignmentType = StringExtensions.GetStringBetweenTwoStrings(assignment.Target.OdataType, AppConfiguration.STRINGTOREMOVE, pattern2);
        }
        if (assignment.Target.GroupId is not null)
        {
            targetId = assignment.Target.GroupId;
        }
        return new CustomAssignmentsModel
        {
            ResourceType = resourceType,
            AssignmentType = assignmentType,
            IsAssigned = assignment != null,
            TargetId = targetId,
            TargetName = assignment?.Target?.OdataType,
            ResourceId = resourceId,
            ResourceName = resourceName,
            FilterId = filterId,
            FilterType = assignment?.Target?.DeviceAndAppManagementAssignmentFilterType ?? "None"
        };
    }
}