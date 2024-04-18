using IntuneAssistant.Enums;
using IntuneAssistant.Extensions;
using IntuneAssistant.Models;
using IntuneAssistant.Models.Group;
using Microsoft.IdentityModel.Tokens;


namespace IntuneAssistant.Helpers;

public class AssignmentsHelper
{
    public static List<GlobalResourceModel> ConvertToGlobalResources(List<dynamic> result)
    {
        var globalResources = result.Select(response => new GlobalResourceModel
        {
            Id = response.Id,
            DisplayName = response.DisplayName
        }).ToList();
        return globalResources;
    }
    public class GlobalResourceModel
    {
        public string Id { get; set; }
        public string DisplayName { get; set; }
    }
}