using System.CommandLine;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.IdentityModel.Tokens;
using Spectre.Console;
using Newtonsoft.Json;

namespace IntuneAssistant.Cli.Commands.Policies.Configuration;

public class ConfigPoliciesImportCmd : Command<ImportConfigurationPoliciesCommandOptions,ImportConfigurationPoliciesCommandHandler>
{
    public ConfigPoliciesImportCmd() : base(CommandConfiguration.ImportCommandName, CommandConfiguration.ImportCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.ImportPathArg, CommandConfiguration.ImportPathArgDescription));
        AddOption(new Option<string>(CommandConfiguration.ImportFileArg, CommandConfiguration.ImportFileArgDescription));
    }
}

public class ImportConfigurationPoliciesCommandOptions : ICommandOptions
{
    public string ImportPath { get; set; } = string.Empty;
    public string ImportFile { get; set; } = string.Empty;
}


public class ImportConfigurationPoliciesCommandHandler : ICommandOptionsHandler<ImportConfigurationPoliciesCommandOptions>
{

    private readonly IConfigurationPolicyService _configurationPolicyService;
    private readonly IIdentityHelperService _identityHelperService;

    public ImportConfigurationPoliciesCommandHandler(IConfigurationPolicyService configurationPoliciesService, IIdentityHelperService identityHelperService)
    {
        _configurationPolicyService = configurationPoliciesService;
        _identityHelperService = identityHelperService;
    }
    public async Task<int> HandleAsync(ImportConfigurationPoliciesCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }

        try
        {
            var importPath = options.ImportPath;
            var importFile = options.ImportFile;
            if (!importFile.IsNullOrEmpty())
            {
                string filePath = $@"{importFile}";

                if (!File.Exists(filePath))
                {
                    AnsiConsole.MarkupLine($"[red]File in {filePath} does not exist[/]");
                    return -1;
                }

                string content = await File.ReadAllTextAsync(filePath);
                var result = JsonConvert.DeserializeObject<ConfigurationPolicyModel>(content);
                if (result is not null)
                {
                    var response =
                        await _configurationPolicyService.CreateConfigurationPolicyAsync(accessToken, result);
                    return response;
                }
            }

            if (!importPath.IsNullOrEmpty())
            {

            }
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("Your custom error message: " + ex.Message);
            Console.ResetColor();
        }

        return 0;
    }
}