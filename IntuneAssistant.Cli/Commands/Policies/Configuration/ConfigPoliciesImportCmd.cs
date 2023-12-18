using System.CommandLine;
using IntuneAssistant.Constants;
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
        AddOption(new Option<bool>(CommandConfiguration.InteractiveArg, CommandConfiguration.InteractiveArgDescription));
        AddOption(new Option<bool>(CommandConfiguration.ForceArg, CommandConfiguration.ForceArgDescription));
    }
}

public class ImportConfigurationPoliciesCommandOptions : ICommandOptions
{
    public string ImportPath { get; set; } = string.Empty;
    public string ImportFile { get; set; } = string.Empty;
    public bool SelectFiles { get; set; } = false;
    public bool Force { get; set; } = false;
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
            var selectFilesProvided = options.SelectFiles;
            var forceProvided = options.Force;
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
                    
                    return 0;
                }
            }

            if (!importPath.IsNullOrEmpty() && selectFilesProvided )
            {
                string[] fileNames = Directory.GetFiles(importPath).OrderBy(f => f).ToArray();

                var selectedFiles = AnsiConsole.Prompt(
                    new MultiSelectionPrompt<string>()
                        .Title("Which [green]files[/] do you want to select form import?")
                        .NotRequired() // Not required to select a file
                        .PageSize(AppConfiguration.FILES_PAGESIZE)
                        .MoreChoicesText("[grey](Move up and down to reveal more files)[/]")
                        .InstructionsText(
                            "[grey](Press [blue]<space>[/] to toggle a file, " + 
                            "[green]<enter>[/] to accept)[/]")
                        .AddChoices(fileNames));
                foreach (var file in selectedFiles)
                {
                    string content = await File.ReadAllTextAsync(file);
                    var result = JsonConvert.DeserializeObject<ConfigurationPolicyModel>(content);
                    if (result is not null)
                    {
                        await _configurationPolicyService.CreateConfigurationPolicyAsync(accessToken, result);
                    }
                }
                return 0;
            }

            if (!importPath.IsNullOrEmpty())
            {
                if (!forceProvided)
                {
                    ConsoleKey input;
                    do {
                        AnsiConsole.MarkupLine($"[red]Are you sure to import all JSON files from folder {importPath}?[/]");
                        AnsiConsole.MarkupLine($"[yellow]HINT: Use --force to skip this message[/]");
                        input = Console.ReadKey().Key;
                        switch (input)
                        {
                            case ConsoleKey.Y:
                                string[] fileNames = Directory.GetFiles(importPath).OrderBy(f => f).ToArray();
                                foreach (var file in fileNames)
                                {
                                    string content = await File.ReadAllTextAsync(file);
                                    var result = JsonConvert.DeserializeObject<ConfigurationPolicyModel>(content);
                                    if (result is not null)
                                    {
                                        await _configurationPolicyService.CreateConfigurationPolicyAsync(accessToken, result);
                                    }
                                }
                                break;
                            case ConsoleKey.N:
                                break;
                            default:
                                AnsiConsole.MarkupLine("[red]Invalid input. Please press y or n.[/]");
                                break;
                        }
                    } while (input != ConsoleKey.Y && input != ConsoleKey.N);
                }
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