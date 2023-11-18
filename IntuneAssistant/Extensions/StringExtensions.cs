using System.Text.RegularExpressions;

namespace IntuneAssistant.Extensions;


/// <summary>
/// Extension methods for <see cref="string"/>.
/// </summary>
public static class StringExtensions
{
    /// <summary>
    /// Returns a substring of the given string, ensuring that the substring is within the bounds of the string.
    /// </summary>
    /// <param name="value">The original base string.</param>
    /// <param name="startIndex">The index of the base string where we start the new substring.</param>
    /// <param name="length">The number of characters to add to the <paramref name="startIndex"/>.</param>
    /// <returns>A substring of the given string otherwise the original string itself.</returns>
    public static string SafeSubstring(this string value, int startIndex, int length)
    {
        if (string.IsNullOrEmpty(value))
            return string.Empty;

        if (startIndex < 0)
            startIndex = 0;

        if (startIndex > value.Length)
            return string.Empty;

        if (length < 0)
            length = 0;

        if (startIndex + length > value.Length)
            length = value.Length - startIndex;

        return value.Substring(startIndex, length);
    }
    
    public static string GetStringBetweenTwoStrings(string input, string pattern1, string pattern2)
    {
        string pattern = $"{Regex.Escape(pattern1)}(.*?){Regex.Escape(pattern2)}";
        var match = Regex.Match(input, pattern);
        return match.Groups[1].Value;
    }
}
