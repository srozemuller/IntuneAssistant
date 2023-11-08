using IntuneAssistant.Helpers;
using IntuneAssistant.Interfaces;

namespace IntuneAssistant.Services;

public sealed class LogoutService : ILogoutService
{

    public async Task LogoutFromIntune()
    {
        var pca = IdentityHelper.GetDefaultClientApplication();
        var accounts = pca.GetAccountsAsync().Result;
        while (accounts.Any())
        {
            await pca.RemoveAsync(accounts.FirstOrDefault());
            accounts = await pca.GetAccountsAsync();
            Console.WriteLine($"Logged out {accounts}");
        }
        
    }
}