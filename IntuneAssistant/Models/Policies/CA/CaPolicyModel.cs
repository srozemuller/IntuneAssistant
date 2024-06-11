using IntuneAssistant.Models.Group;
using IntuneAssistant.Models.Users;

namespace IntuneAssistant.Models.Policies.CA;

public class ConditionalAccessPolicyModel
{
    public Guid Id { get; set; }
    public string TemplateId { get; set; }
    public string DisplayName { get; set; }
    public DateTime CreatedDateTime { get; set; }
    public DateTime ModifiedDateTime { get; set; }
    public string State { get; set; }
    public object PartialEnablementStrategy { get; set; }
    public object SessionControls { get; set; }
    public Conditions Conditions { get; set; }
    public GrantControls GrantControls { get; set; }
}

public class Conditions
{
    public List<object> UserRiskLevels { get; set; }
    public List<object> SignInRiskLevels { get; set; }
    public List<string> ClientAppTypes { get; set; }
    public object Platforms { get; set; }
    public object Locations { get; set; }
    public object Times { get; set; }
    public object DeviceStates { get; set; }
    public object Devices { get; set; }
    public object ClientApplications { get; set; }
    public Applications Applications { get; set; }
    public Users Users { get; set; }
}

public class Applications
{
    public List<string> IncludeApplications { get; set; }
    public List<object> ExcludeApplications { get; set; }
    public List<object> IncludeUserActions { get; set; }
    public List<object> IncludeAuthenticationContextClassReferences { get; set; }
    public object ApplicationFilter { get; set; }
}

public class Users
{
    public List<string> IncludeUsers { get; set; }
    public List<UserModel> IncludeUsersReadable { get; set; }
    public List<string> ExcludeUsers { get; set; }
    public List<UserModel> ExcludeUsersReadable { get; set; }
    public List<string> IncludeGroups { get; set; }
    public List<GroupModel> IncludeGroupsReadable { get; set; }
    public List<string> ExcludeGroups { get; set; }
    public List<GroupModel> ExcludeGroupsReadable { get; set; }
    public List<object> IncludeRoles { get; set; }
    public List<object> ExcludeRoles { get; set; }
    public object IncludeGuestsOrExternalUsers { get; set; }
    public object ExcludeGuestsOrExternalUsers { get; set; }
}

public class GrantControls
{
    public string Operator { get; set; }
    public List<string> BuiltInControls { get; set; }
    public List<object> CustomAuthenticationFactors { get; set; }
    public List<object> TermsOfUse { get; set; }
    public string AuthenticationStrengthODataContext { get; set; }
    public object AuthenticationStrength { get; set; }
}
