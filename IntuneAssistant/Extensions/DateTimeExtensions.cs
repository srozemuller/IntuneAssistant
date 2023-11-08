namespace IntuneAssistant.Extensions;

/// <summary>
/// Extension methods for DateTime.
/// </summary>
public static class DateTimeExtensions
{
    /// <summary>
    /// Truncate a DateTime to a specified TimeSpan.
    /// </summary>
    /// <example>Truncate to a whole minute:<br/> DateTime.Truncate(TimeSpan.FromMinutes(1));<br/><br/></example>
    /// <example>Truncate to a whole second:<br/> DateTime.Truncate(TimeSpan.FromSeconds(1));<br/><br/></example>
    /// <example>Truncate to a whole millisecond:<br/> DateTime.Truncate(TimeSpan.FromMilliseconds(1));<br/><br/></example>
    /// <param name="dateTime"></param>
    /// <param name="timeSpan"></param>
    /// <returns>A DateTime object with truncated value.</returns>
    public static DateTime Truncate(this DateTime dateTime, TimeSpan timeSpan)
    {
        if (timeSpan == TimeSpan.Zero) return dateTime;
        if (dateTime == DateTime.MinValue || dateTime == DateTime.MaxValue) return dateTime;
        return dateTime.AddTicks(-(dateTime.Ticks % timeSpan.Ticks));
    }
}
