using IntuneAssistant.Helpers;
using IntuneAssistant.Infrastructure.Interfaces.Logging;
using Microsoft.JSInterop;

namespace IntuneAssistant.Infrastructure.Services.LoggingServices;

public class WebApplicationInsightsService : IApplicationInsightsService
{
    private readonly IJSRuntime _jsRuntime;

    public WebApplicationInsightsService(IJSRuntime jsRuntime)
    {
        _jsRuntime = jsRuntime;
    }

    public async Task TrackExceptionAsync(ExceptionHelper.CustomException exception)
    {
        await _jsRuntime.InvokeVoidAsync("appInsights.trackException", exception);
    }

    public async Task TrackTraceAsync(ExceptionHelper.CustomException exception)
    {
        await _jsRuntime.InvokeVoidAsync("appInsights.trackTrace", exception);
    }

    public async Task TrackJsonExceptionAsync(ExceptionHelper.CustomJsonException exception)
    {
        await _jsRuntime.InvokeVoidAsync("appInsights.trackException", exception);
    }

    public async Task TrackJsonTraceAsync(ExceptionHelper.CustomJsonException exception)
    {
        await _jsRuntime.InvokeVoidAsync("appInsights.trackTrace", exception);
    }
}