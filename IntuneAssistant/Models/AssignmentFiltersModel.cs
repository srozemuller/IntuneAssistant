namespace IntuneAssistant.Models;

public class AssignmentFiltersModel
{
        public string Id { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public DateTime LastModifiedDateTime { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public string Platform { get; set; }
        public string Rule { get; set; }
        public string AssignmentFilterManagementType { get; set; }
}