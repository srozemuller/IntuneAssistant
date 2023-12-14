using System.CommandLine;

namespace IntuneAssistant.Cli.Commands.Policies.Configuration;

public static class ConfigurationPoliciesCmd
    {
        public static Command New()
        {

            var configPoliciesCommand = new Command(CommandConfiguration.ConfigurationPolicyCommandName,
                CommandConfiguration.ConfigurationPolicyCommandDescription);

            configPoliciesCommand.AddCommand(new ConfigPoliciesListCmd());
            configPoliciesCommand.AddCommand(new ConfigPoliciesExportCmd());
            configPoliciesCommand.AddCommand(new ConfigPoliciesImportCmd());
            return configPoliciesCommand;
        }
    }
