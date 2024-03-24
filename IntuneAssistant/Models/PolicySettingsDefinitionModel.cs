using Newtonsoft.Json;

namespace IntuneAssistant.Models;

public class CustomPolicySettingsModel
{
    public string Id { get; set; }
    public string PolicyId { get; set; }
    public string SettingName { get; set; }
    public string SettingValue { get; set; }
    public List<ChildSettingInstance> ChildSettings { get; set; }
    public List<ChildInfoObject> ChildSettingInfo { get; set; }
    public SettingDefinition[] SettingDefinitions { get; set; }
    
}

public class PolicySettingsDefinitionModel
{
    public Settinginstance settingInstance { get; set; }
    public SettingDefinition[] settingDefinitions { get; set; }
}

public class ChildInfoObject
{
    [JsonProperty("@odata.type")]
    public string odatatype { get; set; }
    public string Name { get; set; }
    public string Value { get; set; }
    
}

public class Settinginstance
{
    [JsonProperty("@odata.type")] public string odatatype { get; set; }
    public string settingDefinitionId { get; set; }
    public object settingInstanceTemplateReference { get; set; }
    public ChoiceSettingvalue? choiceSettingValue { get; set; }
    public List<GroupSettingCollectionValue>? groupSettingCollectionValue { get; set; }
    
    public SimpleSettingValue? SimpleSettingValue { get; set; }
}

public class GroupSettingCollectionValue
{
    public object settingValueTemplateReference { get; set; }
    public List<ChildSettingInstance> children { get; set; }
}

public class ChoiceSettingvalue
{
    public object settingValueTemplateReference { get; set; }
    public string value { get; set; }
    public List<ChildSettingInstance> children { get; set; }
}

public class SettingDefinition
{
    public string odatatype { get; set; }
    public string accessTypes { get; set; }
    public string[] keywords { get; set; }
    public object[] infoUrls { get; set; }
    public string baseUri { get; set; }
    public string offsetUri { get; set; }
    public string rootDefinitionId { get; set; }
    public string categoryId { get; set; }
    public string settingUsage { get; set; }
    public string uxBehavior { get; set; }
    public string visibility { get; set; }
    public string id { get; set; }
    public object description { get; set; }
    public string helpText { get; set; }
    public string name { get; set; }
    public string displayName { get; set; }
    public string version { get; set; }
    public string defaultOptionId { get; set; }
    public Applicability applicability { get; set; }
    public Occurrence occurrence { get; set; }
    public object[] referredSettingInformationList { get; set; }
    public Option[] options { get; set; }
}

public class Applicability
{
    public string odatatype { get; set; }
    public object description { get; set; }
    public string platform { get; set; }
    public string deviceMode { get; set; }
    public string technologies { get; set; }
    public string configurationServiceProviderVersion { get; set; }
    public object maximumSupportedVersion { get; set; }
    public string minimumSupportedVersion { get; set; }
    public string[] windowsSkus { get; set; }
    public bool requiresAzureAd { get; set; }
    public string requiredAzureAdTrustType { get; set; }
}

public class Occurrence
{
    public int minDeviceOccurrence { get; set; }
    public int maxDeviceOccurrence { get; set; }
}

public class Option
{
    public string itemId { get; set; }
    public object description { get; set; }
    public object helpText { get; set; }
    public string name { get; set; }
    public string displayName { get; set; }
    public Optionvalue optionValue { get; set; }
    public object[] dependentOn { get; set; }
    public Dependedonby[] dependedOnBy { get; set; }
}

public class Optionvalue
{
    public string odatatype { get; set; }
    public object settingValueTemplateReference { get; set; }
    public string value { get; set; }
}

public class Dependedonby
{
    public string dependedOnBy { get; set; }
    public bool required { get; set; }
}

public class ChildSettingInstance
{
    public string odatatype { get; set; }
    public string settingDefinitionId { get; set; }
    public object settingInstanceTemplateReference { get; set; }
    public SimpleSettingValue simpleSettingValue { get; set; }
    public ChildChoiceSettingValue choiceSettingValue { get; set; }
}

public class SimpleSettingValue
{
    public string odatatype { get; set; }
    public object settingValueTemplateReference { get; set; }
    public string value { get; set; }
}

public class ChildChoiceSettingValue
{
    public object settingValueTemplateReference { get; set; }
    public string value { get; set; }
    public List<object> children { get; set; }
}


public static class PolicySettingsModelExtensions
{
    public static CustomPolicySettingsModel ToPolicySettingsModel(this PolicySettingsDefinitionModel policySettings, string policyId)
    {
        var settingDefinition =
            policySettings.settingDefinitions.FirstOrDefault(sd => policySettings.settingInstance.settingDefinitionId == sd.id);
        var settingValue = "Not Configured";
        var childSettingName = "Not Configured";
        IEnumerable<ChildSettingInstance> childSettings = new List<ChildSettingInstance>();
        var childSettingsInfo = new List<ChildInfoObject>();
        if (policySettings.settingInstance.groupSettingCollectionValue is not null)
        {
            childSettings = policySettings.settingInstance.groupSettingCollectionValue.SelectMany(x => x.children);
        }
        if (policySettings.settingInstance.choiceSettingValue is not null)
        {
            settingValue = settingDefinition?.options.Select(o => o)
                .Where(v => v.itemId == policySettings.settingInstance.choiceSettingValue.value)
                .Select(x => x.displayName)
                .FirstOrDefault();
            childSettings = policySettings.settingInstance.choiceSettingValue.children;
            if (childSettings is not null)
            {
                foreach (var childSetting in childSettings)
                {
                    var childSettingValue = "Not Configured";
                    if (childSetting.simpleSettingValue is not null)
                    {
                        childSettingValue = childSetting.simpleSettingValue.value;
                    }
                    else
                    {
                        childSettingValue = policySettings.settingDefinitions.SelectMany(s => s.options).Where(o => o.itemId == childSetting.choiceSettingValue.value).Select(v => v.displayName).FirstOrDefault().ToString();
                    }
                    var childName = policySettings.settingDefinitions.FirstOrDefault(s => s.id == childSetting.settingDefinitionId).displayName;
                    var ChildInfo = new ChildInfoObject
                    {
                        odatatype = childSetting.odatatype,
                        Name = childName,
                        Value = childSettingValue
                    };
                    childSettingsInfo.Add(ChildInfo);
                }
            }
        }
        else
        {
            settingValue = policySettings.settingInstance.SimpleSettingValue?.value;
            childSettings = new List<ChildSettingInstance>();
        }

        return new CustomPolicySettingsModel
        {
            Id = settingDefinition.id,
            PolicyId =  policyId,
            SettingName = settingDefinition.displayName,
            SettingValue = settingValue,
            ChildSettingInfo = childSettingsInfo,
            SettingDefinitions = policySettings.settingDefinitions
        };
    }
}