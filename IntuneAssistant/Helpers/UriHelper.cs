using System.Globalization;
using System.Text;

namespace Interstellar.Utilities.Helpers;

/// <summary>
/// Helper class for URI related functions
/// </summary>
public static class UriHelper
{
    private const string MS_ONLINE_AUTHORIZE = "https://login.microsoftonline.com/{0}/oauth2/v2.0/authorize";
    private static readonly string[] ValidPromptValues = { "login", "none", "consent", "select_account" };

    /// <summary>
    /// Generates a URL to the Microsoft Graph consent page.
    /// </summary>
    /// <param name="tenantId">The Tenant ID to use in the URL</param>
    /// <param name="applicationId">The Application ID to use in the URL</param>
    /// <param name="scope">The scope(s) to use in the URL</param>
    /// <param name="redirectUri">The redirect URI to use in the URL</param>
    /// <param name="relationId">The Relation ID to use in the URL</param>
    /// <param name="prompt">The type of prompt to use in the URL. Must be a valid type as listed in <see cref="ValidPromptValues"/></param>
    /// <returns></returns>
    /// <exception cref="ArgumentException"></exception>
    public static string GenerateGraphConsentUrl(string tenantId, string applicationId, string[] scope, string redirectUri, string? relationId = null, string? prompt = null)
    {
        if (prompt is not null && !ValidPromptValues.Contains(prompt))
            throw new ArgumentException($"The value '{prompt}' is not a valid prompt value", nameof(prompt));

        var bld = new StringBuilder();
        bld.Append("&scope=");

        for (var i = 0; i < scope.Length; i++)
        {
            bld.Append(scope[i]);

            // Only add a space (HTML entity) between values
            if (i + 1 != scope.Length)
                bld.Append("%20");
        }

        var scopeParam = bld.ToString();

        // Optionally append Relation ID to the state parameter
        var state = tenantId;
        if (!string.IsNullOrEmpty(relationId))
        {
            state = $"{relationId}:{tenantId}";
        }

        // Build the entire URL
        var baseUrl = string.Format(CultureInfo.InvariantCulture, MS_ONLINE_AUTHORIZE, tenantId);
        var queryParams = $"?client_id={applicationId}&response_type=code&response_mode=query&redirect_uri={redirectUri}&state={state}{scopeParam}";

        // Optionally append prompt parameter
        if (!string.IsNullOrWhiteSpace(prompt))
            queryParams += $"&prompt={prompt}";

        return string.Concat(baseUrl, queryParams);
    }

    /// <summary>
    /// Extracts the base URL from the URL used inside an API Definition.
    /// </summary>
    /// <param name="requestUrl">The string to extract URL from.</param>
    /// <returns>A string containing the base URL or null.</returns>
    public static string? ExtractBaseUrl(string? requestUrl)
    {
        return string.IsNullOrWhiteSpace(requestUrl) ? null : requestUrl.Split(';')[0];
    }
}
