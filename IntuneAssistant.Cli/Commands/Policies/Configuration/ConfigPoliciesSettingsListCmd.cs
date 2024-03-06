using System.CommandLine;
using IntuneAssistant.Infrastructure.Interfaces;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Policies.Configuration;

public class ConfigPoliciesSettingsListCmd : Command<FetchConfigurationPoliciesSettingsListCommandOptions,FetchConfigurationPoliciesSettingsListCommandHandler>
{
    public ConfigPoliciesSettingsListCmd() : base(CommandConfiguration.PoliciesSettingsCommandName, CommandConfiguration.PoliciesSettingsCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.IdArg, CommandConfiguration.IdArgDescription));
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<string>(CommandConfiguration.PoliciesSearchSettingName, CommandConfiguration.PoliciesSearchSettingDescription));
        AddOption(new Option<string>(CommandConfiguration.PoliciesSearchValueName, CommandConfiguration.PoliciesSearchValueDescription));
    }
}


public class FetchConfigurationPoliciesSettingsListCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
    public string SearchSetting { get; set; } = String.Empty;
    public string SearchValue { get; set; } = String.Empty;
}


public class FetchConfigurationPoliciesSettingsListCommandHandler : ICommandOptionsHandler<FetchConfigurationPoliciesSettingsListCommandOptions>
{

    private readonly IConfigurationPolicyService _configurationPolicyService;
    private readonly IIdentityHelperService _identityHelperService;

    public FetchConfigurationPoliciesSettingsListCommandHandler(IConfigurationPolicyService configurationPoliciesService, IIdentityHelperService identityHelperService)
    {
        _configurationPolicyService = configurationPoliciesService;
        _identityHelperService = identityHelperService;
    }
    public async Task<int> HandleAsync(FetchConfigurationPoliciesSettingsListCommandOptions options)
    {
        var accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        var searchValueProvided = !string.IsNullOrEmpty(options.SearchValue);
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            AnsiConsole.MarkupLine("Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }
        var exportCsvProvided = !string.IsNullOrWhiteSpace(options.ExportCsv);
        var table = new Table();
        table.Collapse();
        table.AddColumn("PolicyName");
        table.AddColumn("MainSettingName");
        table.AddColumn("MainSettingValue");
        table.AddColumn("ChildSettingName");
        table.AddColumn("ChildSettingValue");

        // Show progress spinner while fetching data
        await AnsiConsole.Status().StartAsync("Fetching configuration policies from Intune", async _ =>
        {
            var allConfigurationPoliciesResults = await _configurationPolicyService.GetConfigurationPoliciesListAsync(accessToken);
            var policyId = "8e3f8a9a-04d2-4013-b941-d2ff55c79eff"; 
            var configurationPoliciesSettingsResults = await _configurationPolicyService.GetConfigurationPoliciesSettingsListAsync(accessToken,policyId);
            if (configurationPoliciesSettingsResults is not null)
            {
                foreach (var setting in configurationPoliciesSettingsResults)
                {
                    var settingValue = "Not configured";
                    var childSettingsNames = new List<string>();
                    var childSettingsValues = new List<string>();
                    foreach (var childSetting in setting.ChildSettings)
                    {
                        var childSettingInfo =
                            setting.SettingDefinitions.FirstOrDefault(sd => childSetting.settingDefinitionId == sd.id);
                        if (childSetting?.simpleSettingValue is not null)
                        {
                            var childSettingValue = childSetting.simpleSettingValue.value;
                            childSettingsNames.Add(childSettingInfo.displayName);
                            childSettingsValues.Add(childSettingValue);
                        }
                    }
            
                    if (settingValue is not null)
                    {
                        table.AddRow(
                            allConfigurationPoliciesResults.Where(i => i.Id == policyId).Select(x => x.Name)
                                .FirstOrDefault().EscapeMarkup(),
                            setting.SettingName.EscapeMarkup(),
                            setting.SettingValue.EscapeMarkup(),
                            string.Join(Environment.NewLine, childSettingsNames).EscapeMarkup(),
                            string.Join(Environment.NewLine, childSettingsValues).EscapeMarkup()
                        );
                    }
                }
            }

        });
        AnsiConsole.Write(table);
        return 0;
    }
}