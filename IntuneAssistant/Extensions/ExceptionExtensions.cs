namespace IntuneAssistant.Extensions;

/// <summary>
/// Extension methods for <see cref="Exception"/>.
/// </summary>
public static class ExceptionExtensions
{
    /// <summary>
    /// Gets the inner exception's message if it exists, otherwise returns the exception's message.
    /// </summary>
    /// <param name="e"></param>
    /// <returns>A string with the inner exception message otherwise the exception message itself.</returns>
    public static string ToMessage(this Exception e)
    {
        return e.InnerException?.Message ?? e.ToString();
    }
}
