using IntuneAssistant.Helpers;

namespace IntuneAssistant.Infrastructure.Interfaces.Logging;

public interface IApplicationInsightsService
{
    Task TrackExceptionAsync(ExceptionHelper.CustomException exception);
    Task TrackTraceAsync(ExceptionHelper.CustomException exception);
    
    Task TrackJsonExceptionAsync(ExceptionHelper.CustomJsonException exception);
    Task TrackJsonTraceAsync(ExceptionHelper.CustomJsonException exception);
}