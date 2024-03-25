using System.CommandLine;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Spectre.Console;

namespace IntuneAssistant.Cli.Commands.Policies.Configuration;

public class ConfigPoliciesSettingsListCmd : Command<FetchConfigurationPoliciesSettingsListCommandOptions,
    FetchConfigurationPoliciesSettingsListCommandHandler>
{
    public ConfigPoliciesSettingsListCmd() : base(CommandConfiguration.PoliciesSettingsCommandName,
        CommandConfiguration.PoliciesSettingsCommandDescription)
    {
        AddOption(new Option<string>(CommandConfiguration.IdArg, CommandConfiguration.IdArgDescription));
        AddOption(new Option<string>(CommandConfiguration.ExportCsvArg, CommandConfiguration.ExportCsvArgDescription));
        AddOption(new Option<string>(CommandConfiguration.PoliciesSearchSettingName,
            CommandConfiguration.PoliciesSearchSettingDescription));
        AddOption(new Option<string>(CommandConfiguration.PoliciesSearchValueName,
            CommandConfiguration.PoliciesSearchValueDescription));
    }
}

public class FetchConfigurationPoliciesSettingsListCommandOptions : ICommandOptions
{
    public string ExportCsv { get; set; } = string.Empty;
    public string SearchSetting { get; set; } = String.Empty;
    public string SearchValue { get; set; } = String.Empty;
}

public class
    FetchConfigurationPoliciesSettingsListCommandHandler : ICommandOptionsHandler<
        FetchConfigurationPoliciesSettingsListCommandOptions>
{
    private readonly IConfigurationPolicyService _configurationPolicyService;
    private readonly IIdentityHelperService _identityHelperService;

    public FetchConfigurationPoliciesSettingsListCommandHandler(
        IConfigurationPolicyService configurationPoliciesService, IIdentityHelperService identityHelperService)
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
            AnsiConsole.MarkupLine(
                "Unable to query Microsoft Intune without a valid access token. Please run the 'auth login' command to authenticate or pass a valid access token with the --token argument");
            return -1;
        }

        var exportCsvProvided = !string.IsNullOrWhiteSpace(options.ExportCsv);
        var table = new Table();
        List<CustomPolicySettingsModel>? _settingsOverview = new();
        table.Collapse();
        table.AddColumn("PolicyName");
        table.AddColumn("MainSettingName");
        table.AddColumn("MainSettingValue");
        table.AddColumn("ChildSettingName");
        table.AddColumn("ChildSettingValue");

        // Show progress spinner while fetching data
        await AnsiConsole.Status().StartAsync("Fetching configuration policies from Intune", async _ =>
        {
            var configurationPolicies =
                await _configurationPolicyService.GetConfigurationPoliciesListAsync(accessToken);
            if (configurationPolicies != null)
                foreach (var policy in configurationPolicies)
                {
                    
                    var configurationPoliciesSettingsResults =
                        await _configurationPolicyService.GetConfigurationPoliciesSettingsListAsync(accessToken,
                            policy);
                    if (configurationPoliciesSettingsResults is not null)
                    {
                        foreach (var setting in configurationPoliciesSettingsResults)
                        {
                            string settingValue = null;
                            if (setting.ChildSettingInfo.Any())
                            {
                                foreach (var childSetting in setting.ChildSettingInfo)
                                {
                                    var policyName = configurationPolicies.FirstOrDefault(x => x.Id == setting.PolicyId)
                                        ?.Name;
                                    var settingName = setting.SettingName;
                                    settingValue = setting.SettingValue;
                                    _settingsOverview.Add(new CustomPolicySettingsModel
                                    {
                                        PolicyId = policyName,
                                        SettingName = settingName,
                                        SettingValue = settingValue,
                                        ChildSettingInfo = setting.ChildSettingInfo
                                    });
                                }
                            }

                            if (settingValue is not null)
                            {
                                table.AddRow(
                                    configurationPolicies.Where(i => i.Id == policy.Id).Select(x => x.Name)
                                        .FirstOrDefault().EscapeMarkup(),
                                    setting.SettingName.EscapeMarkup(),
                                    setting.SettingValue.EscapeMarkup(),
                                    string.Join(Environment.NewLine, setting.ChildSettingInfo.ToString()).EscapeMarkup(),
                                    string.Join(Environment.NewLine, setting.ChildSettingInfo.ToString()).EscapeMarkup()
                                );
                            }
                        }
                    }
                }
        });
        AnsiConsole.Write(table);
        return 0;
    }
}