using Microsoft.Graph.Beta.Models;
using Microsoft.IdentityModel.Tokens;
using IntuneAssistant.Extensions;

namespace IntuneAssistant.Models;

public class AssignmentInfoModel
{
    public string FilterType { get; set; } = String.Empty;
    public string AssignmentType { get; init; } = String.Empty;
    public bool IsAssigned { get; set; } = false;
}

public static class AssignmentInfoModelExtensions
{
    public static AssignmentInfoModel ToAssignmentInfoModel(this DeviceAndAppManagementAssignmentTarget? target)
    {
        if (target is not null)
        {
            string targetType = target.DeviceAndAppManagementAssignmentFilterType.ToString();
            var isAssigned = !target.DeviceAndAppManagementAssignmentFilterType.ToString().IsNullOrEmpty();
            string pattern1 = "Microsoft.Graph.Beta.Models.";
            string pattern2 = "AssignmentTarget";
            string assignmentType = StringExtensions.GetStringBetweenTwoStrings(target.ToString(), pattern1, pattern2); 
            
            return new AssignmentInfoModel
            {
                AssignmentType = assignmentType,
                IsAssigned = isAssigned,
                FilterType = targetType
            };
        }
        return new AssignmentInfoModel();
    }
} 