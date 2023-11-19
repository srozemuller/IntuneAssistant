namespace IntuneAssistant.Helpers;

public static class ResourceHelper
{
    public static string GetResourceTypeFromOdata (string odataString)
    {
        string[] strArray = odataString.Split('.'); // splits the string into an array of substrings
        string lastValue = strArray[strArray.Length - 1];
        return lastValue;
    }
}
