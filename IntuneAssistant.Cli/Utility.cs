using System.Text.Json;

namespace IntuneAssistant.Cli;

public static class Utility
{
    public static int CalculatePercentage(int current, int total)
    {
        return (int)Math.Round((double)current / total * 100);
    }

    public static double CalculateIncrementForPercentage(double total)
    {
        return Math.Round(100 / total, 2);
    }

    public static readonly JsonSerializerOptions JsonSerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };
}
