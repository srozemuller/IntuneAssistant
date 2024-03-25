using System.CommandLine;
using IntuneAssistant.Cli.Commands.Tenant.Roles;
using IntuneAssistant.Cli.Commands.Tenant.Roles.RoleAssignments;
using IntuneAssistant.Cli.Commands.Tenant.Roles.RoleDefinitions;

namespace IntuneAssistant.Cli.Commands.Tenant;

public static class TenantInformationCmd
{
    public static Command New()
    {
        var tenantCommand = new Command(CommandConfiguration.TenantCommandName, CommandConfiguration.TenantCommandDescription);
        var globalOption = new Option<string>(CommandConfiguration.PaginationFlag,
            CommandConfiguration.PaginationFlagsDescription);
        tenantCommand.AddGlobalOption(globalOption);
        var roleDefinitionsCommand = RolesCmd.New();
        tenantCommand.AddCommand(roleDefinitionsCommand);

        return tenantCommand;
    }
}