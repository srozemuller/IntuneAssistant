using System.CommandLine;
using System.CommandLine.NamingConventionBinder;
using Microsoft.Extensions.DependencyInjection;

namespace IntuneAssistant.Cli.Commands;

public interface ICommandOptions
{
}

public interface ICommandOptionsHandler<in TOptions>
{
    Task<int> HandleAsync(TOptions options);
}

public abstract class Command<TOptions, TOptionsHandler> : Command
    where TOptions : class, ICommandOptions
    where TOptionsHandler : class, ICommandOptionsHandler<TOptions>
{
    protected Command(string name, string description)
        : base(name, description)
    {
        Handler = CommandHandler.Create<TOptions, IServiceProvider>(HandleOptions);
    }

    private static async Task<int> HandleOptions(TOptions options, IServiceProvider serviceProvider)
    {
        // True dependency injection happening here
        var handler = ActivatorUtilities.CreateInstance<TOptionsHandler>(serviceProvider);
        return await handler.HandleAsync(options);
    }
}
