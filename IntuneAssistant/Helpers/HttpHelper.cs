using System.Net;

namespace IntuneAssistant.Helpers;

/// <summary>
/// Helper class for HTTP status codes.
/// </summary>
public static class HttpHelper
{
    /// <summary>
    /// Returns true if the HTTP status code is in the 100 range.
    /// </summary>
    /// <param name="httpStatusCode">The HTTP status code to check.</param>
    /// <returns>A boolean indicating whether the HTTP status code is in the 100 range.</returns>
    public static bool InHttp100Range(HttpStatusCode httpStatusCode)
    {
        var range = new List<HttpStatusCode>
        {
            HttpStatusCode.Continue,
            HttpStatusCode.SwitchingProtocols,
        };

        return range.Contains(httpStatusCode);
    }

    /// <summary>
    /// Returns true if the HTTP status code is in the 200 range.
    /// </summary>
    /// <param name="httpStatusCode">The HTTP status code to check.</param>
    /// <returns>A boolean indicating whether the HTTP status code is in the 200 range.</returns>
    public static bool InHttp200Range(HttpStatusCode httpStatusCode)
    {
        var range = new List<HttpStatusCode>
        {
            HttpStatusCode.OK,
            HttpStatusCode.Created,
            HttpStatusCode.Accepted,
            HttpStatusCode.NonAuthoritativeInformation,
            HttpStatusCode.NoContent,
            HttpStatusCode.ResetContent,
            HttpStatusCode.PartialContent,
            HttpStatusCode.IMUsed,
        };

        return range.Contains(httpStatusCode);
    }

    /// <summary>
    /// Returns true if the HTTP status code is in the 300 range.
    /// </summary>
    /// <param name="httpStatusCode">The HTTP status code to check.</param>
    /// <returns>A boolean indicating whether the HTTP status code is in the 300 range.</returns>
    public static bool InHttp300Range(HttpStatusCode httpStatusCode)
    {
        var range = new List<HttpStatusCode>
        {
            HttpStatusCode.MultipleChoices,
            HttpStatusCode.MovedPermanently,
            HttpStatusCode.Found,
            HttpStatusCode.SeeOther,
            HttpStatusCode.NotModified,
            HttpStatusCode.UseProxy,
            HttpStatusCode.TemporaryRedirect,
            HttpStatusCode.PermanentRedirect,
        };

        return range.Contains(httpStatusCode);
    }

    /// <summary>
    /// Returns true if the HTTP status code is in the 400 range.
    /// </summary>
    /// <param name="httpStatusCode">The HTTP status code to check.</param>
    /// <returns>A boolean indicating whether the HTTP status code is in the 400 range.</returns>
    public static bool InHttp400Range(HttpStatusCode httpStatusCode)
    {
        var range = new List<HttpStatusCode>
        {
            HttpStatusCode.BadRequest,
            HttpStatusCode.Unauthorized,
            HttpStatusCode.PaymentRequired,
            HttpStatusCode.Forbidden,
            HttpStatusCode.NotFound,
            HttpStatusCode.MethodNotAllowed,
            HttpStatusCode.NotAcceptable,
            HttpStatusCode.ProxyAuthenticationRequired,
            HttpStatusCode.RequestTimeout,
            HttpStatusCode.LengthRequired,
            HttpStatusCode.PreconditionFailed,
            HttpStatusCode.RequestEntityTooLarge,
            HttpStatusCode.RequestUriTooLong,
            HttpStatusCode.UnsupportedMediaType,
            HttpStatusCode.RequestedRangeNotSatisfiable,
            HttpStatusCode.ExpectationFailed,
            HttpStatusCode.MisdirectedRequest,
            HttpStatusCode.UpgradeRequired,
            HttpStatusCode.PreconditionFailed,
            HttpStatusCode.TooManyRequests,
            HttpStatusCode.RequestHeaderFieldsTooLarge,
            HttpStatusCode.UnavailableForLegalReasons,
        };

        return range.Contains(httpStatusCode);
    }

    /// <summary>
    /// Returns true if the HTTP status code is in the 500 range.
    /// </summary>
    /// <param name="httpStatusCode">The HTTP status code to check.</param>
    /// <returns>A boolean indicating whether the HTTP status code is in the 500 range.</returns>
    public static bool InHttp500Range(HttpStatusCode httpStatusCode)
    {
        var range = new List<HttpStatusCode>
        {
            HttpStatusCode.InternalServerError,
            HttpStatusCode.NotImplemented,
            HttpStatusCode.BadGateway,
            HttpStatusCode.ServiceUnavailable,
            HttpStatusCode.GatewayTimeout,
            HttpStatusCode.HttpVersionNotSupported,
            HttpStatusCode.VariantAlsoNegotiates,
            HttpStatusCode.NotExtended,
            HttpStatusCode.NetworkAuthenticationRequired,
        };

        return range.Contains(httpStatusCode);
    }

    /// <summary>
    /// Returns true if the HTTP status code is in the Webdav range.
    /// </summary>
    /// <param name="httpStatusCode">The HTTP status code to check.</param>
    /// <returns>A boolean indicating whether the HTTP status code is in the Webdav range.</returns>
    public static bool InHttpWebdavRange(HttpStatusCode httpStatusCode)
    {
        var range = new List<HttpStatusCode>
        {
            HttpStatusCode.Processing,
            HttpStatusCode.MultiStatus,
            HttpStatusCode.AlreadyReported,
            HttpStatusCode.UnprocessableEntity,
            HttpStatusCode.Locked,
            HttpStatusCode.FailedDependency,
            HttpStatusCode.InsufficientStorage,
            HttpStatusCode.LoopDetected,
        };

        return range.Contains(httpStatusCode);
    }
}
