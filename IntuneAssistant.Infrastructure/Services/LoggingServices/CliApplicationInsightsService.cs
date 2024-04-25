using IntuneAssistant.Helpers;
using IntuneAssistant.Infrastructure.Interfaces.Logging;

namespace IntuneAssistant.Infrastructure.Services.LoggingServices;

public class CliApplicationInsightsService : IApplicationInsightsService
{
    public Task TrackExceptionAsync(ExceptionHelper.CustomException exception)
    {
        return Task.CompletedTask;
    }

    public Task TrackTraceAsync(ExceptionHelper.CustomException exception)
    {
        return Task.CompletedTask;
    }

    public Task TrackJsonExceptionAsync(ExceptionHelper.CustomJsonException exception)
    {
        return Task.CompletedTask;
    }

    public Task TrackJsonTraceAsync(ExceptionHelper.CustomJsonException exception)
    {
        return Task.CompletedTask;
    }
}