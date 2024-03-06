using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using IntuneAssistant.Enums;

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

public static class ODataTypeExtensions
{
    public static string ToHumanReadableString(this string odataType)
    {
        switch (odataType)
        {
            case "#microsoft.graph.allLicensedUsersAssignmentTarget":
                return "All Licensed Users";
            case "#microsoft.graph.allDevicesAssignmentTarget":
                return "All Devices";
            case "#microsoft.graph.groupAssignmentTarget":
            case "#microsoft.graph.group":
                return "Group";
            case "#microsoft.graph.exclusionGroupAssignmentTarget":
                return "Group Exclude";
            default:
                throw new ArgumentOutOfRangeException(nameof(odataType), odataType, null);
        }
    }
}

public static class ODataContext
{
    public static string FetchIdFromContext(this string odataContext)
    {
        // Define the regular expression pattern
        string pattern = @"'([^']+)'";

        // Create a Regex object
        Regex regex = new Regex(pattern);

        // Match the pattern in the URL
        Match match = regex.Match(odataContext);

        // Check if a match is found
        if (match.Success)
        {
            // Extract and return the ID from the matched group
            return match.Groups[1].Value;
        }

        // Return null if no match is found
        return null;
    }
}

public class ODataTypeConverter : JsonConverter<AssignmentODataTypes>
{
    public override AssignmentODataTypes Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        value = value.Replace("#microsoft.graph.", "");
        value = string.Concat(value.Select(x => Char.IsUpper(x) ? "_" + x : x.ToString())).TrimStart('_');
        value = value.Replace("_", "");
        return Enum.Parse<AssignmentODataTypes>(value, true);
    }

    public override void Write(Utf8JsonWriter writer, AssignmentODataTypes value, JsonSerializerOptions options)
    {
        var stringValue = value.ToString();
        stringValue = "#microsoft.graph." + string.Concat(stringValue.Select(x => char.IsUpper(x) ? "_" + x.ToString() : x.ToString())).TrimStart('_').ToLower();
        writer.WriteStringValue(stringValue);
    }
}