using System.Text;

namespace Interstellar.Utilities.Helpers;

/// <summary>
/// Extension methods for <see cref="string"/> to help with HTML formatting.
/// </summary>
public static class HtmlStringHelper
{
    /// <summary>
    /// Replaces all occurrences of `\r\n` and `\n` with `&lt;br/&gt;`.
    /// </summary>
    /// <param name="input">The input text.</param>
    /// <returns>A new string with all line breaks replaced with HTML breaks.</returns>
    public static string ReplaceReturnWithBreak(string input)
    {
        return input.Replace("\r\n", "<br/>").Replace("\n", "<br/>");
    }

    /// <summary>
    /// Returns a string with the specified amount of empty lines &lt;br/&gt;.
    /// </summary>
    /// <param name="lines">The number of lines to insert.</param>
    /// <returns>A new string of one or more HTML break &lt;br/&gt; elements.</returns>
    /// <exception cref="ArgumentOutOfRangeException"></exception>
    public static string InsertBreak(int lines = 1)
    {
        if (lines <= 0)
            throw new ArgumentOutOfRangeException(nameof(lines), "Lines must be greater than 0");

        var sb = new StringBuilder();

        for (var i = 0; i < lines; i++)
            sb.Append("<br/>");

        return sb.ToString();
    }

    /// <summary>
    /// Returns the given input string wrapped in an HTML bold element.
    /// </summary>
    /// <param name="input">The input string.</param>
    /// <returns>A string wrapped in between &lt;b&gt;&lt;/b&gt; elements.</returns>
    public static string Bold(string input)
    {
        return $"<b>{input}</b>";
    }

    /// <summary>
    /// Returns the given input string wrapped in an HTML italic element.
    /// </summary>
    /// <param name="input">The input string.</param>
    /// <returns>A new string wrapped in between &lt;i&gt;&lt;/i&gt; elements.</returns>
    public static string Italic(string input)
    {
        return $"<i>{input}</i>";
    }

    /// <summary>
    /// Create a HTML anchor element with the given input and href.
    /// </summary>
    /// <param name="href">The URL where the anchor should navigate to.</param>
    /// <param name="input">The name that should be displayed on the HTML page. Defaults to the href value.</param>
    /// <param name="target">Optionally specify the anchor target property.</param>
    /// <returns>An HTML anchor as a string.</returns>
    public static string Anchor(string href, string? input = null, string target = "_self")
    {
        return $"<a href=\"{href}\" target=\"{target}\">{input ?? href}</a>";
    }
}
