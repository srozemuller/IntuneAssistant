namespace IntuneAssistant.Models;

public class RoleDefinitionModel
{
    public string ODataContext { get; set; }
    public string ODataType { get; set; }
    public string Id { get; set; }
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public bool IsBuiltInRoleDefinition { get; set; }
    public bool IsBuiltIn { get; set; }
    public List<string> RoleScopeTagIds { get; set; }
    public List<Permission> Permissions { get; set; }
    public List<RolePermission> RolePermissions { get; set; }
}

public class ResourceAction
{
    public List<string> AllowedResourceActions { get; set; }
    public List<string> NotAllowedResourceActions { get; set; }
}

public class Permission
{
    public List<string> Actions { get; set; }
    public ResourceAction ResourceActions { get; set; }
}

public class RolePermission
{
    public List<string> Actions { get; set; }
    public ResourceAction ResourceActions { get; set; }
}