using System.Text.Json.Serialization;
using IntuneAssistant.Constants;
using IntuneAssistant.Enums;
using IntuneAssistant.Extensions;
using IntuneAssistant.Helpers;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;

namespace IntuneAssistant.Models;

public interface IAssignment
{
    string Id { get; set; }
    string SourceId { get; set; }
    Target Target { get; set; }
    
    
}

public class CustomAssignmentsModel
{
    public string ResourceType { get; set; } = String.Empty;
    public string AssignmentType { get; init; } = String.Empty;
    public bool IsAssigned { get; set; } = false;
    public string TargetId { get; set; } = String.Empty;
    public string TargetName { get; set; } = String.Empty;
    public string? ResourceId { get; set; } = String.Empty;
    public string? ResourceName { get; set; } = String.Empty;
    public string FilterId { get; set; } = String.Empty;
    public string FilterType { get; set; } = "None";
}
public class Target
{
    [JsonPropertyName("@odata.type")]
    [JsonProperty("@odata.type")]
    public string OdataType { get; set; }

    public string? DeviceAndAppManagementAssignmentFilterId { get; set; }
    public string? DeviceAndAppManagementAssignmentFilterType { get; set; }
    public string? GroupId { get; set; }
}

public class Assignment
{
    public string Id { get; set; }
    public string SourceId { get; set; }
    public Target Target { get; set; }
}

public class AssignmentsResponseModel
{
    [JsonPropertyName("@odata.type")]
    public string OdataType { get; set; }

    public string? Id { get; set; }
    public string? DisplayName { get; set; }

    [JsonPropertyName("assignments@odata.context")]
    public string AssignmentsOdataContext { get; set; }

    public List<Assignment>? Assignments { get; set; }
}

public static class AssignmentModelExtensions
{
    public static CustomAssignmentsModel ToAssignmentModel(this Assignment? assignment, AssignmentsResponseModel? assigmentResponseModel, string resourceType)
    {
        var targetId = String.Empty;
        var assignmentType = String.Empty;
        var assigned = false;
        var filterId = "No filter";
        var filterType = "None";
        if (assignment is null)
        {
            assignmentType = "No assignment";
        }
        else
        {
            filterType = assignment.Target.DeviceAndAppManagementAssignmentFilterType;
            if (assignment.Id.IsNullOrEmpty())
            {
                assignmentType = assignment.Target.OdataType;
            }
            if (assignment.Target.DeviceAndAppManagementAssignmentFilterId is not null)
            {
                filterId = assignment.Target.DeviceAndAppManagementAssignmentFilterId;
            }
            if (assignment.Target.OdataType is not null)
            {
                assignmentType = ResourceHelper.GetAssignmentTypeFromOdata(assignment.Target.OdataType);
            }
            if (assignment.Target.GroupId is not null)
            {
                targetId = assignment.Target.GroupId;
            }
            assigned = !assignment.Target.OdataType.IsNullOrEmpty();
        }

        
        return new CustomAssignmentsModel
        {
            AssignmentType = assignmentType,
            IsAssigned = assigned,
            ResourceType = resourceType,
            ResourceId = assigmentResponseModel.Id,
            TargetId = targetId,
            ResourceName = assigmentResponseModel.DisplayName,
            FilterId = filterId,
            FilterType = filterType
        };
    }
    
} 