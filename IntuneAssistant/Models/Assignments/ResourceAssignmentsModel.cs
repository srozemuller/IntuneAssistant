namespace IntuneAssistant.Models.Assignments;

public class ResourceAssignmentsModel
{
    public string ODataContext { get; set; }
    public string Id { get; set; }
    public string DisplayName { get; set; }
    public string AssignmentsODataContext { get; set; }
    public List<Assignment> Assignments { get; set; }
}