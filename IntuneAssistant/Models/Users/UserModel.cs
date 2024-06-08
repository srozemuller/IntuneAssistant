namespace IntuneAssistant.Models.Users;

public class UserModel
{
    public Guid Id { get; set; }
    public DateTime? DeletedDateTime { get; set; }
    public bool AccountEnabled { get; set; }
    public string AgeGroup { get; set; }
    public List<string> BusinessPhones { get; set; } = new List<string>();
    public string City { get; set; }
    public DateTime CreatedDateTime { get; set; }
    public string CreationType { get; set; }
    public string CompanyName { get; set; }
    public string ConsentProvidedForMinor { get; set; }
    public string Country { get; set; }
    public string Department { get; set; }
    public string DisplayName { get; set; }
    public string EmployeeId { get; set; }
    public DateTime? EmployeeHireDate { get; set; }
    public DateTime? EmployeeLeaveDateTime { get; set; }
    public string EmployeeType { get; set; }
    public string FaxNumber { get; set; }
    public string GivenName { get; set; }
    public List<string> ImAddresses { get; set; } = new List<string>();
    public List<string> InfoCatalogs { get; set; } = new List<string>();
    public bool IsLicenseReconciliationNeeded { get; set; }
    public bool? IsManagementRestricted { get; set; }
    public bool? IsResourceAccount { get; set; }
    public string JobTitle { get; set; }
    public string LegalAgeGroupClassification { get; set; }
    public string Mail { get; set; }
    public string MailNickname { get; set; }
    public string MobilePhone { get; set; }
    public string OnPremisesDistinguishedName { get; set; }
    public string OnPremisesDomainName { get; set; }
    public string OnPremisesImmutableId { get; set; }
    public DateTime OnPremisesLastSyncDateTime { get; set; }
    public string OnPremisesSecurityIdentifier { get; set; }
    public string OnPremisesSamAccountName { get; set; }
    public bool? OnPremisesSyncEnabled { get; set; }
    public string OnPremisesUserPrincipalName { get; set; }
    public List<string> OtherMails { get; set; } = new List<string>();
    public string PasswordPolicies { get; set; }
    public string PostalCode { get; set; }
    public string PreferredDataLocation { get; set; }
    public string PreferredLanguage { get; set; }
    public List<string> ProxyAddresses { get; set; } = new List<string>();
    public DateTime RefreshTokensValidFromDateTime { get; set; }
    public string SecurityIdentifier { get; set; }
    public bool? ShowInAddressList { get; set; }
    public DateTime SignInSessionsValidFromDateTime { get; set; }
    public string State { get; set; }
    public string StreetAddress { get; set; }
    public string Surname { get; set; }
    public string UsageLocation { get; set; }
    public string UserPrincipalName { get; set; }
    public DateTime? ExternalUserConvertedOn { get; set; }
    public string ExternalUserState { get; set; }
    public DateTime? ExternalUserStateChangeDateTime { get; set; }
    public string UserType { get; set; }
    public object EmployeeOrgData { get; set; }
    public object PasswordProfile { get; set; }
    public List<object> AssignedLicenses { get; set; } = new List<object>();
    public List<object> AssignedPlans { get; set; } = new List<object>();
    public AuthorizationInfo AuthorizationInfo { get; set; } = new AuthorizationInfo();
    public CloudRealtimeCommunicationInfo CloudRealtimeCommunicationInfo { get; set; } = new CloudRealtimeCommunicationInfo();
    public List<object> DeviceKeys { get; set; } = new List<object>();
    public List<Identity> Identities { get; set; } = new List<Identity>();
    public OnPremisesExtensionAttributes OnPremisesExtensionAttributes { get; set; } = new OnPremisesExtensionAttributes();
    public List<object> OnPremisesProvisioningErrors { get; set; } = new List<object>();
    public OnPremisesSipInfo OnPremisesSipInfo { get; set; } = new OnPremisesSipInfo();
    public List<object> ProvisionedPlans { get; set; } = new List<object>();
    public List<object> ServiceProvisioningErrors { get; set; } = new List<object>();
}

public class AuthorizationInfo
{
    public List<string> CertificateUserIds { get; set; } = new List<string>();
}

public class CloudRealtimeCommunicationInfo
{
    public bool? IsSipEnabled { get; set; }
}

public class Identity
{
    public string SignInType { get; set; }
    public string Issuer { get; set; }
    public string IssuerAssignedId { get; set; }
}

public class OnPremisesExtensionAttributes
{
    public string ExtensionAttribute1 { get; set; }
    public string ExtensionAttribute2 { get; set; }
    public string ExtensionAttribute3 { get; set; }
    public string ExtensionAttribute4 { get; set; }
    public string ExtensionAttribute5 { get; set; }
    public string ExtensionAttribute6 { get; set; }
    public string ExtensionAttribute7 { get; set; }
    public string ExtensionAttribute8 { get; set; }
    public string ExtensionAttribute9 { get; set; }
    public string ExtensionAttribute10 { get; set; }
    public string ExtensionAttribute11 { get; set; }
    public string ExtensionAttribute12 { get; set; }
    public string ExtensionAttribute13 { get; set; }
    public string ExtensionAttribute14 { get; set; }
    public string ExtensionAttribute15 { get; set; }
}

public class OnPremisesSipInfo
{
    public bool IsSipEnabled { get; set; }
    public string SipDeploymentLocation { get; set; }
    public string SipPrimaryAddress { get; set; }
}