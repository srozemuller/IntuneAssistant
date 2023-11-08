namespace IntuneAssistant.Extensions;

public class DateTimeDifference
{
    public static string Calculate(DateTime dateTime )
    {
        DateTime startTime = dateTime;
        DateTime endTime = DateTime.Now; // Current time
        TimeSpan timeDifference = endTime - startTime;

        Console.WriteLine("Time difference is: " + timeDifference);
        return timeDifference.ToString();
    }
}