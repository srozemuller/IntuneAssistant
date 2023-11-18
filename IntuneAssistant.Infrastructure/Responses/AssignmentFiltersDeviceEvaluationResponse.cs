namespace IntuneAssistant.Infrastructure.Responses;

public record Column
{
    public string Name { get; init; }
    public string Type { get; init; }
}

public record DeviceData
{
    public string DeviceCategory { get; init; }
    public string DeviceId { get; init; }
    public string DeviceName { get; init; }
    public string EnrollmentProfileName { get; init; }
    public string IsRooted { get; init; }
    public string DeviceTrustType { get; init; }
    public string Manufacturer { get; init; }
    public string Model { get; init; }
    public string OperatingSystemSKU { get; init; }
    public string OsVersion { get; init; }
    public string DeviceOwnership { get; init; }
    public string UserPrincipalName { get; init; }
}

public record AssignmentFiltersDeviceEvaluationResponse
{
    public int TotalRowCount { get; init; }
    public List<Column> Columns { get; init; }
    public List<List<string>> Values { get; init; }
}
