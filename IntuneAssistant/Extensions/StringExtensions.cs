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
    public static string ToHumanReadableString(this AssignmentODataTypes odataType)
    {
        switch (odataType)
        {
            case AssignmentODataTypes.AllLicensedUsersAssignmentTarget:
                return "All Licensed Users";
            case AssignmentODataTypes.AllDevicesAssignmentTarget:
                return "All Devices";
            // Add other cases as needed
            case AssignmentODataTypes.GroupAssignmentTarget:
                return "Group";
            default:
                throw new ArgumentOutOfRangeException(nameof(odataType), odataType, null);
        }
    }
}
public class ODataTypeConverter : JsonConverter<AssignmentODataTypes>
{
    public override AssignmentODataTypes Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        value = value.Replace("#microsoft.graph.", "");
        value = string.Concat(value.Select(x => Char.IsUpper(x) ? "_" + x.ToString() : x.ToString())).TrimStart('_');
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