using System.CommandLine;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.IdentityModel.Tokens;
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
        var _accessToken = await _identityHelperService.GetAccessTokenSilentOrInteractiveAsync();
        var searchValueProvided = !string.IsNullOrEmpty(options.SearchValue);
        if (string.IsNullOrWhiteSpace(_accessToken))
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
            var configurationPolicies = await _configurationPolicyService.GetConfigurationPoliciesListAsync(_accessToken);

            if (configurationPolicies != null)
            {
                var configurationPoliciesSettingsResults =
                    await _configurationPolicyService.GetConfigurationPoliciesSettingsListAsync(_accessToken,
                        configurationPolicies);

                _settingsOverview.AddRange(from policy in configurationPolicies where configurationPoliciesSettingsResults is not null from setting in configurationPoliciesSettingsResults let settingName = setting.SettingName let settingValue = setting.SettingValue select new CustomPolicySettingsModel { PolicyName = setting.PolicyName, SettingName = settingName, SettingValue = settingValue, ChildSettingInfo = setting.ChildSettingInfo });
            }

            if (_settingsOverview.Any())
            {
                // If a search value is provided, filter the _settingsOverview list
                if (searchValueProvided)
                {
                    _settingsOverview = _settingsOverview.Where(s => 
                        (!string.IsNullOrEmpty(s.SettingName) && s.SettingName.ToLowerInvariant().Contains(options.SearchValue.ToLowerInvariant())) || 
                        (!string.IsNullOrEmpty(s.SettingName) && s.SettingName.ToLowerInvariant().Contains(options.SearchValue.ToLowerInvariant())) || 
                        (!string.IsNullOrEmpty(s.ChildSettingInfo.Select(n => n.Name).ToString()) && s.ChildSettingInfo.Select(n => n.Name.ToString().ToLowerInvariant()).Contains(options.SearchValue.ToLowerInvariant())) || 
                        (!string.IsNullOrEmpty(s.ChildSettingInfo.Select(v => v.Value).ToString()) && s.ChildSettingInfo.Select(v => v.Value?.ToString().ToLowerInvariant()).Contains(options.SearchValue.ToLowerInvariant()))
                    ).ToList();
                }
                foreach (var setting in _settingsOverview)
                {
                    var childSettingsName = setting.ChildSettingInfo.Select(n => n.Name);
                    var childSettingsValue = setting.ChildSettingInfo.Select(n => n.Value);
                    table.AddRow(
                        setting.PolicyName.EscapeMarkup(),
                        setting.SettingName.EscapeMarkup(),
                        setting.SettingValue.EscapeMarkup(),
                        string.Join("\n", childSettingsName).EscapeMarkup(),
                        string.Join("\n", childSettingsValue).EscapeMarkup()
                    );
                }
            }
        });
        AnsiConsole.Write(table);
        return 0;
    }
}