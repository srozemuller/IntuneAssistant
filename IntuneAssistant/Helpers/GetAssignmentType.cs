namespace IntuneAssistant.Helpers;

public class GetAssignmentInfo
{
    public static string AssignmentType(string odataType)
    {
        string assignmentType = new string("");
        switch (odataType)
        {
            case "#microsoft.graph.groupAssignmentTarget":
                assignmentType = "Group";
                break;
            case "#microsoft.graph.deviceAssignmentTarget":
                assignmentType = "Device";
                break;
            case "#microsoft.graph.allLicensedUsersAssignmentTarget":
                assignmentType = "AllLicensedUsers";
                break;
            default:
                assignmentType = "None";
                break;
        }
        return assignmentType;
    }
}