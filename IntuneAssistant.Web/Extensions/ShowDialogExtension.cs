
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Web.Layout.Dialogs;
using MudBlazor;

namespace IntuneAssistant.Web.Extensions;

public static class ShowDialogExtension
{
    public static Task ShowGroupMembersDialog(this IDialogService dialogService, Guid groupId, string groupName)
    {
        var parameters = new DialogParameters();
        parameters.Add("GroupId", groupId);
        parameters.Add("GroupName", groupName);
        var options = new DialogOptions
        {
            ClassBackground = "my-custom-class",
            CloseOnEscapeKey = true,
            DisableBackdropClick = true
        };
        dialogService.Show<GroupDialogComponent>($"{groupName} members", parameters, options);
        return Task.CompletedTask;
    }
}